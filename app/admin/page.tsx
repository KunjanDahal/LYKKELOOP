"use client";

export default function AdminDashboard() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-brown mb-2">Admin Dashboard</h1>
        <p className="text-brown/70">Welcome, Admin.</p>
      </div>

      {/* Dashboard Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Manage Products */}
        <a
          href="/admin/products"
          className="bg-white rounded-2xl p-6 shadow-md border border-brown/10 hover:shadow-lg transition-shadow block"
        >
          <div className="text-4xl mb-4">📦</div>
          <h2 className="text-2xl font-semibold text-brown mb-2">Manage Products</h2>
          <p className="text-brown/70 text-sm mb-4">
            Add, edit, or remove products from your store.
          </p>
          <span className="inline-block px-4 py-2 bg-rose text-white rounded-full font-medium">
            Manage Products →
          </span>
        </a>

        {/* View Orders */}
        <div className="bg-white rounded-2xl p-6 shadow-md border border-brown/10 hover:shadow-lg transition-shadow">
          <div className="text-4xl mb-4">📋</div>
          <h2 className="text-2xl font-semibold text-brown mb-2">View Orders</h2>
          <p className="text-brown/70 text-sm mb-4">
            Track and manage customer orders.
          </p>
          <button
            disabled
            className="px-4 py-2 bg-brown/10 text-brown rounded-full font-medium cursor-not-allowed"
          >
            Coming soon
          </button>
        </div>

        {/* Users */}
        <a
          href="/admin/users"
          className="bg-white rounded-2xl p-6 shadow-md border border-brown/10 hover:shadow-lg transition-shadow block"
        >
          <div className="text-4xl mb-4">👥</div>
          <h2 className="text-2xl font-semibold text-brown mb-2">Users</h2>
          <p className="text-brown/70 text-sm mb-4">
            Manage user accounts and permissions.
          </p>
          <span className="inline-block px-4 py-2 bg-rose text-white rounded-full font-medium">
            Manage Users →
          </span>
        </a>
      </div>

      {/* Quick Stats Placeholder */}
      <div className="mt-8 bg-white rounded-2xl p-6 shadow-md border border-brown/10">
        <h2 className="text-2xl font-semibold text-brown mb-4">Quick Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-beige rounded-lg">
            <div className="text-3xl font-bold text-brown">-</div>
            <div className="text-sm text-brown/70 mt-1">Total Products</div>
          </div>
          <div className="text-center p-4 bg-beige rounded-lg">
            <div className="text-3xl font-bold text-brown">-</div>
            <div className="text-sm text-brown/70 mt-1">Total Orders</div>
          </div>
          <div className="text-center p-4 bg-beige rounded-lg">
            <div className="text-3xl font-bold text-brown">-</div>
            <div className="text-sm text-brown/70 mt-1">Total Users</div>
          </div>
          <div className="text-center p-4 bg-beige rounded-lg">
            <div className="text-3xl font-bold text-brown">-</div>
            <div className="text-sm text-brown/70 mt-1">Revenue</div>
          </div>
        </div>
      </div>
    </div>
  );
}

