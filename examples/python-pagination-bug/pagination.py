def page_summary(total_items: int, page: int, page_size: int) -> str:
    total_pages = max(1, (total_items + page_size - 1) // page_size)
    return f"Page {page} of {total_pages}: {page_size} items"
