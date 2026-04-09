# Animated Diagram Product - Technical Research

## Product Vision

A tool that generates animated flowchart diagrams exported as GIF. Diagrams are stored as structured files (like draw.io), support searchable image/GIF entities, and integrate with Claude Code for AI-driven diagram generation. Users can open diagrams in a browser editor for light editing before exporting.

---

## Architecture Overview

```
                         +-----------------+
                         |   Claude Code   |
                         |   (CLI Tool)    |
                         +--------+--------+
                                  |
                      searches entities, generates
                         diagram JSON via CLI
                                  |
                                  v
+-------------------+    +--------+--------+    +-------------------+
|  Entity Library   |<-->|  Diagram File   |<-->|  Browser Editor   |
|  (JSON Manifest   |    |  (.flow.json)   |    |  (ReactFlow +     |
|   + SVG/PNG/GIF)  |    |                 |    |   custom UI)      |
+-------------------+    +--------+--------+    +-------------------+
                                  |
                          export animation
                                  |
                                  v
                         +--------+--------+
                         |  GIF Exporter   |
                         | (Puppeteer or   |
                         |  gif.js)        |
                         +-----------------+
```

---

## 1. File Format: Custom JSON (`.flow.json`)

### Why JSON over XML?

| Factor | draw.io XML | Custom JSON |
|--------|------------|-------------|
| Readability | Verbose, attributes in strings | Clean, structured |
| CLI generation | Hard (XML escaping, namespaces) | Trivial (`JSON.stringify`) |
| Browser parsing | Needs XML parser | Native `JSON.parse` |
| Animation metadata | Not natively supported | First-class citizen |
| LLM-friendly | Poor (complex syntax) | Excellent (simple structure) |
| Version control | Noisy diffs | Clean diffs |

### Proposed Schema

```json
{
  "version": "1.0",
  "meta": {
    "name": "My Flowchart",
    "created": "2026-04-09T10:00:00Z",
    "author": "Claude Code"
  },
  "canvas": {
    "width": 1200,
    "height": 800,
    "background": "#ffffff"
  },
  "entities": {
    "registry": "default",
    "embedded": [
      {
        "id": "custom-server",
        "name": "My Server",
        "image": "./assets/server.svg",
        "tags": ["infrastructure", "server"]
      }
    ]
  },
  "nodes": [
    {
      "id": "n1",
      "type": "entity",
      "entityId": "database",
      "label": "User DB",
      "position": { "x": 100, "y": 200 },
      "size": { "width": 80, "height": 80 },
      "style": {
        "labelPosition": "bottom",
        "labelColor": "#333333",
        "borderColor": "#2196F3",
        "borderWidth": 2,
        "opacity": 1
      }
    },
    {
      "id": "n2",
      "type": "shape",
      "shape": "rectangle",
      "label": "API Gateway",
      "position": { "x": 300, "y": 200 },
      "size": { "width": 120, "height": 60 },
      "style": {
        "fill": "#E3F2FD",
        "borderColor": "#1565C0",
        "borderRadius": 8,
        "fontSize": 14
      }
    }
  ],
  "edges": [
    {
      "id": "e1",
      "source": "n1",
      "target": "n2",
      "sourceHandle": "right",
      "targetHandle": "left",
      "label": "REST API",
      "style": {
        "stroke": "#666666",
        "strokeWidth": 2,
        "type": "smoothstep",
        "animated": true,
        "arrowHead": "arrow"
      }
    }
  ],
  "animation": {
    "type": "flow",
    "duration": 3000,
    "fps": 12,
    "loop": true,
    "sequences": [
      {
        "id": "seq1",
        "name": "Data Flow",
        "steps": [
          {
            "edgeId": "e1",
            "particleColor": "#2196F3",
            "particleSize": 6,
            "speed": 1.0,
            "startTime": 0,
            "duration": 1500
          }
        ]
      }
    ],
    "nodeEffects": [
      {
        "nodeId": "n2",
        "effect": "pulse",
        "triggerTime": 1500,
        "duration": 500,
        "color": "#4CAF50"
      }
    ]
  }
}
```

### Key Design Decisions

- **Flat structure**: Nodes and edges at top level (no deep nesting) makes CLI generation simple
- **Animation as first-class section**: Separate from visual layout, easy to add/modify
- **Entity references by ID**: Nodes reference entity library items, keeping the diagram file lightweight
- **Embedded entities**: Custom entities can be inlined for portability
- **Style objects**: Structured (not string-encoded like draw.io) for easy programmatic manipulation

---

## 2. Browser Editor: ReactFlow

### Why ReactFlow?

ReactFlow is the strongest choice for this project:

- **MIT License** - free for commercial use
- **React/TypeScript native** - matches your stack perfectly
- **Custom nodes** - render any React component as a node (images, GIFs, SVGs, custom shapes)
- **Built-in edge animation** - CSS-based animated edges out of the box
- **Programmatic API** - easy to load/save diagram state as JSON
- **Large ecosystem** - 25k+ GitHub stars, actively maintained (React 19 support as of Nov 2025)
- **Interactive editing** - drag nodes, connect edges, selection, zoom/pan all built in

### Alternatives Considered

| Library | Verdict | Reason |
|---------|---------|--------|
| **JointJS+** | Good but paid | $3k+ license, overkill for light editing |
| **GoJS** | Too expensive | $3,995+ per developer |
| **Cytoscape.js** | Wrong focus | Graph/network analysis, not flowchart editing |
| **D3.js** | Too low-level | Would need to build everything from scratch |
| **Rete.js** | Wrong paradigm | Node-based programming editor, not diagrams |
| **draw.io embed** | Limited | iframe-only, can't customize animation/export |
| **Excalidraw** | Whiteboard-focused | No programmatic API, limited embed support |

### Implementation Approach

```
Browser Editor Stack:
+---------------------------------------------+
|  React App (Vite + TypeScript)              |
|  +---------------------------------------+  |
|  |  ReactFlow Canvas                     |  |
|  |  - Custom EntityNode component        |  |
|  |  - Custom ShapeNode component         |  |
|  |  - Animated edges (CSS + SVG)         |  |
|  |  - Flow particle animation overlay    |  |
|  +---------------------------------------+  |
|  +------------------+ +------------------+  |
|  |  Entity Search   | |  Properties      |  |
|  |  Panel (Fuse.js) | |  Panel           |  |
|  +------------------+ +------------------+  |
|  +---------------------------------------+  |
|  |  Animation Controls + GIF Export      |  |
|  +---------------------------------------+  |
+---------------------------------------------+
```

### Custom Node Example (EntityNode)

```tsx
import { Handle, Position } from 'reactflow';

function EntityNode({ data }) {
  return (
    <div className={`entity-node ${data.pulsing ? 'pulse' : ''}`}>
      <Handle type="target" position={Position.Left} />
      <img src={data.imageUrl} alt={data.label} />
      <div className="label">{data.label}</div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
```

---

## 3. Entity Library System

### Structure

```
entities/
  manifest.json          # Master index of all entities
  categories/
    networking/
      router.svg
      switch.svg
      firewall.svg
    databases/
      postgresql.svg
      mysql.svg
      redis.svg
    general/
      process.svg
      decision.svg
      start-end.svg
    animated/
      loading-spinner.gif
      data-stream.gif
```

### Manifest Format

```json
{
  "version": "1.0",
  "entities": [
    {
      "id": "router",
      "name": "Router",
      "category": "networking",
      "tags": ["network", "routing", "infrastructure", "hardware"],
      "description": "Network router device",
      "image": "categories/networking/router.svg",
      "format": "svg",
      "animated": false
    },
    {
      "id": "data-stream",
      "name": "Data Stream",
      "category": "animated",
      "tags": ["data", "flow", "animation", "transfer"],
      "description": "Animated data stream indicator",
      "image": "categories/animated/data-stream.gif",
      "format": "gif",
      "animated": true
    }
  ]
}
```

### Search Implementation

Use **Fuse.js** for fuzzy search across the entity manifest:

```typescript
import Fuse from 'fuse.js';

const fuse = new Fuse(manifest.entities, {
  keys: [
    { name: 'name', weight: 0.4 },
    { name: 'tags', weight: 0.3 },
    { name: 'category', weight: 0.2 },
    { name: 'description', weight: 0.1 }
  ],
  threshold: 0.4,
  includeScore: true
});

// CLI: `flowdiagram search "database"`
// Returns: [{ id: "postgresql", name: "PostgreSQL", ... }, ...]
```

### Image Format Recommendations

| Format | Use For | Pros | Cons |
|--------|---------|------|------|
| **SVG** | Icons, shapes, symbols | Scalable, tiny size, styleable | Complex for photos |
| **PNG** | Screenshots, complex graphics | Universal support | Fixed resolution |
| **GIF** | Animated entities only | Simple animation | Large file size, 256 colors |

**Default to SVG** for static entities. Use GIF only when the entity itself needs to be animated (e.g., a spinning gear, data pulse).

---

## 4. GIF Export Pipeline

### Recommended Approach: Dual-Mode Export

#### Browser-Side (Preview & Quick Export)

```
ReactFlow Canvas
    |
    v
Canvas Rendering (html2canvas or OffscreenCanvas)
    |
    v  (frame-by-frame at 12 FPS)
gif.js (Web Worker encoding)
    |
    v
Animated GIF blob -> download
```

**Library: gif.js**
- Runs in Web Workers (non-blocking UI)
- Pure JavaScript, no dependencies
- Good quality with configurable palette

#### Server-Side (CLI / High-Quality Export)

```
.flow.json file
    |
    v
Puppeteer (headless Chrome)
    |  Loads diagram in browser context
    |  Runs animation loop
    v  Captures frames via page.screenshot()
gif-encoder-2 (Node.js)
    |
    v
Animated GIF file
```

**Why Puppeteer for server-side?**
- Renders the exact same ReactFlow output as the browser
- Captures CSS animations, SVG rendering, custom fonts
- Consistent output between preview and export

### Animation Rendering: Flow Particles

The core animation effect - particles moving along edges:

```typescript
// Conceptual animation loop
function renderFrame(time: number, ctx: CanvasRenderingContext2D) {
  // 1. Draw static diagram (nodes + edges)
  drawStaticDiagram(ctx, diagramState);

  // 2. For each animated edge, calculate particle position
  for (const seq of animation.sequences) {
    for (const step of seq.steps) {
      const progress = ((time - step.startTime) % step.duration) / step.duration;
      const edgePath = getEdgeSVGPath(step.edgeId);
      const totalLength = edgePath.getTotalLength();
      const point = edgePath.getPointAtLength(progress * totalLength);

      // Draw particle
      ctx.beginPath();
      ctx.arc(point.x, point.y, step.particleSize, 0, Math.PI * 2);
      ctx.fillStyle = step.particleColor;
      ctx.fill();
    }
  }

  // 3. Apply node effects (pulse, glow, etc.)
  for (const effect of animation.nodeEffects) {
    if (time >= effect.triggerTime && time < effect.triggerTime + effect.duration) {
      applyNodeEffect(ctx, effect);
    }
  }
}
```

### GIF Parameters

| Parameter | Recommended | Notes |
|-----------|-------------|-------|
| FPS | 10-12 | Good balance of smoothness vs file size |
| Duration | 2-4 seconds | Loops well, reasonable file size |
| Resolution | 800x600 | Standard, scales well |
| Colors | 256 (GIF limit) | Use dithering for gradients |
| File size target | < 2 MB | Suitable for docs, Slack, email |

---

## 5. CLI Tool Design (Claude Code Integration)

### Command Structure

```bash
# Initialize a new diagram
flowdiagram init my-diagram.flow.json

# Search entities
flowdiagram entities search "database"
flowdiagram entities list --category networking

# Add nodes
flowdiagram add node \
  --entity postgresql \
  --label "User DB" \
  --position 100,200

# Add edges
flowdiagram add edge \
  --from n1 --to n2 \
  --label "REST API" \
  --animated true

# Configure animation
flowdiagram animate \
  --edge e1 \
  --particle-color "#2196F3" \
  --speed 1.0

# Export
flowdiagram export gif my-diagram.flow.json \
  --output diagram.gif \
  --fps 12 \
  --duration 3000

# Open in browser editor
flowdiagram open my-diagram.flow.json
```

### Programmatic API (for Claude Code)

More practically, Claude Code would generate the `.flow.json` file directly:

```typescript
// Claude Code generates this script
import { FlowDiagram } from 'flowdiagram';

const diagram = new FlowDiagram();

// Search and use entities
const dbEntity = await diagram.searchEntity('database');
const apiEntity = await diagram.searchEntity('api gateway');

// Build diagram
const db = diagram.addNode({
  entity: dbEntity[0],
  label: 'User DB',
  position: { x: 100, y: 200 }
});

const api = diagram.addNode({
  entity: apiEntity[0],
  label: 'API Gateway',
  position: { x: 300, y: 200 }
});

diagram.addEdge({
  source: db,
  target: api,
  label: 'REST',
  animated: true
});

// Add flow animation
diagram.addFlowAnimation({
  edge: 'e1',
  particleColor: '#2196F3',
  speed: 1.0
});

// Save
diagram.save('my-diagram.flow.json');

// Export GIF
await diagram.exportGif('output.gif', { fps: 12, duration: 3000 });
```

### Claude Code MCP Integration

For tightest integration, expose as an MCP server:

```json
{
  "tools": [
    {
      "name": "search_diagram_entities",
      "description": "Search for diagram entities by name or tag",
      "input_schema": {
        "type": "object",
        "properties": {
          "query": { "type": "string" }
        }
      }
    },
    {
      "name": "create_diagram",
      "description": "Create a new animated diagram from a specification",
      "input_schema": {
        "type": "object",
        "properties": {
          "nodes": { "type": "array" },
          "edges": { "type": "array" },
          "animation": { "type": "object" }
        }
      }
    },
    {
      "name": "export_gif",
      "description": "Export a diagram as an animated GIF",
      "input_schema": {
        "type": "object",
        "properties": {
          "diagramPath": { "type": "string" },
          "outputPath": { "type": "string" }
        }
      }
    }
  ]
}
```

---

## 6. Complete Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **File Format** | Custom JSON (`.flow.json`) | Diagram storage |
| **Browser Editor** | ReactFlow + React 19 + TypeScript | Visual editing |
| **Entity Search** | Fuse.js | Fuzzy search across entity manifest |
| **Entity Storage** | SVG/PNG/GIF files + JSON manifest | Searchable icon library |
| **Edge Animation** | SVG path + CSS animations | Flow particles along edges |
| **Node Effects** | CSS animations (pulse, glow) | Visual feedback |
| **GIF Export (browser)** | gif.js (Web Workers) | Client-side GIF encoding |
| **GIF Export (server)** | Puppeteer + gif-encoder-2 | High-quality headless export |
| **CLI Framework** | Commander.js or yargs | CLI command structure |
| **Build Tool** | Vite | Fast dev server + bundling |
| **Package Manager** | pnpm | Monorepo support |
| **MCP Server** | @anthropic/sdk | Claude Code integration |

---

## 7. Project Structure

```
flowdiagram/
  packages/
    core/                    # Shared types, schema, utilities
      src/
        types.ts             # TypeScript interfaces for .flow.json
        schema.ts            # JSON schema validation (ajv)
        entities.ts          # Entity search & management
    editor/                  # Browser-based editor
      src/
        App.tsx
        components/
          Canvas.tsx          # ReactFlow wrapper
          EntityNode.tsx      # Custom node for entities
          ShapeNode.tsx       # Custom node for shapes
          AnimatedEdge.tsx    # Custom animated edge
          EntitySearch.tsx    # Search panel with Fuse.js
          AnimationControls.tsx
          GifExporter.tsx     # gif.js integration
        hooks/
          useFlowDiagram.ts  # Load/save .flow.json
          useAnimation.ts    # Animation state management
          useEntitySearch.ts # Entity search hook
    cli/                     # CLI tool
      src/
        index.ts             # Commander.js commands
        commands/
          init.ts
          entities.ts        # search, list, add
          export.ts          # GIF export via Puppeteer
          open.ts            # Launch browser editor
    mcp-server/              # MCP server for Claude Code
      src/
        index.ts
        tools/
          searchEntities.ts
          createDiagram.ts
          exportGif.ts
  entities/                  # Default entity library
    manifest.json
    categories/
      ...
```

---

## 8. Development Roadmap

### Phase 1: Foundation (2-3 weeks)
- Define `.flow.json` schema with TypeScript types + JSON Schema validation
- Build entity manifest system with Fuse.js search
- Create basic ReactFlow editor that loads/saves `.flow.json`
- Implement custom EntityNode and ShapeNode components
- Ship a default entity library (20-30 common flowchart shapes + icons)

### Phase 2: Animation (2-3 weeks)
- Implement flow particle animation on edges (SVG path interpolation)
- Add node pulse/glow effects
- Build animation timeline controls in the editor
- Create animation preview (play/pause/scrub)

### Phase 3: GIF Export (1-2 weeks)
- Browser-side export with gif.js
- Server-side export with Puppeteer + gif-encoder-2
- Quality/size optimization controls

### Phase 4: CLI + Claude Code Integration (1-2 weeks)
- Build CLI with Commander.js
- Entity search command
- Diagram generation from JSON
- GIF export command
- `open` command to launch browser editor

### Phase 5: MCP Server (1 week)
- Expose entity search, diagram creation, and GIF export as MCP tools
- Test with Claude Code end-to-end

---

## 9. Key Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| GIF file size too large | Unusable output | Limit resolution, FPS, duration; offer WebM as alternative |
| ReactFlow performance with many nodes | Laggy editor | Virtualization (built into ReactFlow); limit to ~200 nodes |
| SVG path animation complexity | Curved edges hard to animate | Use ReactFlow's smoothstep edge type (predictable paths) |
| Entity library too small | Limited utility | Start with common shapes; allow user-contributed entities |
| Puppeteer headless rendering differences | GIF doesn't match preview | Use same React build for both; test on CI |

---

## 10. References

- [ReactFlow Documentation](https://reactflow.dev)
- [gif.js - Browser GIF Encoder](https://jnordberg.github.io/gif.js/)
- [gif-encoder-2 - Node.js GIF Encoder](https://www.npmjs.com/package/gif-encoder-2)
- [Fuse.js - Fuzzy Search Library](https://www.fusejs.io/)
- [draw.io File Format Reference](https://www.drawio.com/doc/faq/diagram-source-edit)
- [Excalidraw JSON Schema](https://docs.excalidraw.com/docs/codebase/json-schema)
- [SVG Path Animation Techniques](https://tympanus.net/codrops/2022/01/19/animate-anything-along-an-svg-path/)
- [JointJS Animated Flow Demo](https://www.jointjs.com/demos/animated-process-flow-diagram)
- [Puppeteer Screencast API](https://pptr.dev/api/puppeteer.page.screencast)
- [Claude MCP Specification](https://modelcontextprotocol.io)