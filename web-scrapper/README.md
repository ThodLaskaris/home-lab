# Home lab Suite

A high performance Automation ecosystem combining Web Scraping, AI receipt analysis (using Phone), binary data persistence.
Engineered for maximum speed and efficiency.

## Mission & Accessibility
This project is an **accessibility tool** developed to solve real-world navigation and inventory problems for a **person with disabilities**, enabling independent household management through an optimized, high-speed interface.
    
# Tech Stack 
**AI Analytics**
- **Gemini 2.5**: for high accuracy OCR and data normalization from receipt images
- **Azure Forms Intelligence**: Robust data parsing with automated fallback logic using Azure Forms Intelligence.

**Cloud & Data Architecture**
- **GoLang & gRPC**: High-speed pipeline for concurrent serialization and real time binary data streaming
- **Azure Infrastructure**: Azure Blob Storage for raw assets and Azure Functions for serverless AI processing
- **Database**: Structured SQL schema for relational data persistence.

**Data Efficiency**
- Serialization: Achieved 68% smaller payload compared to standard JSON (1.0MB reduced to 365KB).
- Binary Persistence: Low-latency storage using the .msgpack format for production-ready datasets

**Scraper Engine**
- **Playwright** Utilized and optimised for large scale, concurrent batch category processing
- **Hardware Optimization**: Specifically tuned for the Apple M4, **achieving 17 concurrent batches** without performance degradation

**Frontend**: 
- **Svelte / Astro**: Reactive, lightweight UI/UX powered by Tailwind CSS for smooth perfomance.

## Architecture

- 'Scraper': Core logic for data extraction from e-commerce platforms
- **'Price-Scanner-AI'**: Python-based service for AI-powered receipt scanning and parsing
- **'Common'**: Shared configs, error schemas and handlers
-  **'Proto'**: gRPC definitions for high-performance GoLang-to-Binary serialization
- **scrapeMeDaddy.msgpack:** Production ready binary / source of truth for AI Scans

## Benchmarks
- JSON Raw Size: 1.0MB ( 27.000 lines)
- Binary Size: 365KB

## Programming Languages
- Javascript
- Python
- GoLang

## Development Time 
- **Duration**: ~12hours Saturday night fever
- **Scope**: To get some sleep 