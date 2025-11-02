# controllers.cover_controller se router ko import karna
from controllers.cover_controller import router as cover_router

# Is file ka maqsad aapke file structure ko maintain karna hai.
# Humara main.py is file se 'cover_router' ko import karega.

# Agar future mein 'covers' se related aur routers hon (jaise 'brands'),
# to woh sab yahaan ikattha kiye ja sakte hain.