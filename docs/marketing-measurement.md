# Marketing measurement

The website's Gumroad CTA opens a product page. Its analytics event is
outbound_product_click, with item_id, item_name, listed_price_usd and
destination_url. It records interest in a product; it is not a checkout start,
completed purchase, paid revenue or confirmed email opt-in.

The earlier begin_checkout event was fired at the outgoing website CTA. Treat
historical instances from this source as product clicks when assessing the funnel.
Do not combine them with verified Gumroad sales or use them as proof of revenue.

Use Gumroad's actual successful orders and net retained revenue for sales reports.
Keep test purchases separate. Email delivery, double opt-in and verified-buyer
exclusion need their own account-level checks before enabling nurture automation.
