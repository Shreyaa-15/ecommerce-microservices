import random
from locust import HttpUser, task, between


class ShopUser(HttpUser):
    """
    Simulates realistic e-commerce user behaviour.
    Shows request throughput, response times, failure rates.
    Perfect for portfolio — demonstrates you think about scale.
    """
    wait_time = between(1, 3)
    token = None
    user_id = None

    def on_start(self):
        """Register + login at session start."""
        email = f"user{random.randint(1, 100000)}@test.com"
        r = self.client.post("/auth/register", json={
            "email":    email,
            "name":     "Test User",
            "password": "password123"
        })
        if r.status_code == 200:
            data = r.json()
            self.token   = data["access_token"]
            self.user_id = data["user_id"]

    @task(5)
    def browse_products(self):
        """Most common action — browsing."""
        self.client.get("/products/")

    @task(3)
    def browse_category(self):
        category = random.choice(["electronics", "books", "footwear", "home", "fitness"])
        self.client.get(f"/products/?category={category}")

    @task(2)
    def view_product(self):
        product_id = random.randint(1, 8)
        self.client.get(f"/products/{product_id}")

    @task(1)
    def place_order(self):
        """Less frequent — placing an order."""
        if not self.token:
            return
        product_id = random.randint(1, 8)
        quantity   = random.randint(1, 3)
        self.client.post("/orders/", json={
            "user_id": self.user_id,
            "items": [{"product_id": product_id, "quantity": quantity}]
        }, headers={"Authorization": f"Bearer {self.token}"})

    @task(1)
    def view_orders(self):
        if not self.token or not self.user_id:
            return
        self.client.get(
            f"/orders/user/{self.user_id}",
            headers={"Authorization": f"Bearer {self.token}"}
        )