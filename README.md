# Home lab Suite

A high-performance automation suite combining Massive Web Scraping, Fuzzy logic matching, and Binary Data Serialization.
Engineered for maximum speed and efficiency.

## Mission & Accessibility
This project is an **accessibility tool** developed to solve real-world navigation and inventory problems for a **person with disabilities**, enabling independent household management through an optimized, high-speed interface.
    
# Tech Stack 
**GO & gRPC**
- High-speed pipeline for concurrent serialization and real-time binary data streaming.

**Custom Matching Engine**
- Combines TF-IDF for semantic relevance with Levenshtein Distance for character-level error correction, ensuring over 92% accuracy even with typo-heavy receipt data.
**Data Efficiency**
- Optimized storage using the .msgpack format for production-ready, low-latency datasets.

**Scraper Engine**
- **Playwright** Node.js & Playwright: Optimized for large-scale, concurrent batch category processing.
- **Hardware Optimization**: Specifically tuned for the Apple M4, **achieving 17 concurrent batches** without performance degradation

**Frontend**: 
- **Svelte / Astro**: Reactive, lightweight UI/UX powered by Tailwind CSS for smooth performance and user experience.
- **Tailwind CSS**

## Architecture

- 'Scraper': Core logic for data extraction from e-commerce platforms
- **'Common'**: Shared configs, error schemas and handlers
-  **'Proto'**: gRPC definitions for high-performance Go-to-Binary serialization

## Benchmarks
- Example JSON Raw Size: 1.0MB (27.000 lines) to Binary Size: 365KB
- Final dataset size: 2.3MB

## Programming Languages
- Go
- JavaScript

## Development Time 
- **Duration**: ~12 hours Saturday night fever (POC)
- **Scope**: To get some sleep 

## Development Changes
- **RnD**: More than 36 hours to find the best combination of technologies and algorithms and adjust the pipeline to the needs of the project
- Removed AI Scanning from the pipeline because of the bad data quality from the receipt
  (the problem still exists, but it's not a big deal if you don't use the AI)


graph TD
subgraph Scraping_Phase [Scraping Phase - Node.js & Playwright]
Ahttps://eslspeaking.org/list-of-categories/ --> B{17 Concurrent Tabs}
B --> C[DOM Extraction]
B --> D[API Interception]
end

    subgraph Pipeline [Real-time Pipeline - gRPC]
        C & D -->|Concurrent Stream| E[gRPC StreamProducts]
    end

    subgraph Go_Engine [Processing & Persistence - Go Engine]
        E --> F[Go Matcher/Validator]
        F --> G[MessagePack Serialization]
        G --> H[(catalog.bin / .msgpack)]
    end

    subgraph Receipt_Workflow [Receipt Workflow]
        I[ΑΑΔΕ Receipt URL] --> J[Node.js Extractor]
        J --> K[Go Hybrid Matcher]
        K --> L[Final Expense Report]
    end