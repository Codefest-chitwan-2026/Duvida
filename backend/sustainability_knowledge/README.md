# Sustainability knowledge base

Drop reference material here — PDF, DOCX, or TXT (SDG guides, municipality
guidelines, waste/water management docs, etc). Everything in this folder is
loaded as plain text and passed to Gemini as context, so EcoBot's answers stay
grounded in your sources instead of the model's own guesses.

No chunking or vector search — the docs are just concatenated and sent whole,
which is fine as long as the combined text stays well under Gemini's context
window. Revisit this if the knowledge base grows large enough that stuffing
it all into every request stops being practical.
