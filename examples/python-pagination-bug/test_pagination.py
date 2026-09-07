import unittest

from pagination import page_summary


class PageSummaryTests(unittest.TestCase):
    def test_final_partial_page_reports_remaining_items(self) -> None:
        self.assertEqual(page_summary(total_items=11, page=3, page_size=5), "Page 3 of 3: 1 item")


if __name__ == "__main__":
    unittest.main()
