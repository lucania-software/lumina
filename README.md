# Lumina

A rendering engine for high-performance 3D graphics in your browser!

- Contains a high-level rendering abstraction.
  - Strictly adheres to the [SOLID principles](https://en.wikipedia.org/wiki/SOLID).
  - Provides a graphics API-agnostic interface for interacting with graphics resources using the [factory design pattern](https://en.wikipedia.org/wiki/Factory_method_pattern).
  - Currently only has support for a [WebGPU](https://en.wikipedia.org/wiki/WebGPU) backend.

> ⚠️ **Note:** This project is currently under active development and may change frequently.
> Because the project is still in early stages of development, the interface is constantly changing. Because of this, documentation has not yet been released.

### High Level

- **Renderer** - Used to make rendering requests.
  - **GraphicsFactory** - Used to create graphics resources.
- **_Data_**
  - **Buffer** - Represents data to be sent to the GPU.
  - **Material** - Represents the visual properties of renderable objects.
    - **Texture** - Represents pixel data that can be sampled by the GPU.
  - **Model** - Represents an object in the 3D world that can be rendered.
    - **Mesh** - Represents renderable geometry.
    - **Vertex** - Represents a point in 3D space used to make up geometry.
      - **VertexAttribute** - Represents an attribute of a vertex, I.E. position, color, normals, UV coordinates, etc.
  - **Uniform** - Represents a CPU value that can be sent to the GPU.
  - **Instance Manager** - Manages rendering the same model many times.
- **_Process_**
  - **Pipeline** - Used to manage the stages of rendering.
  - **Shader** - Represents a program to be executed by a pipeline, on the GPU.

> Made with ❤️ by [Jeremy Bankes](https://jeremybankes.com/)
