function PlaceholderPage({ title, description }) {
  return (
    <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8">
      <p className="mb-2 text-sm font-semibold text-blue-600">
        Wanderlust Control Center
      </p>

      <h2 className="m-0 text-3xl font-bold">{title}</h2>

      <p className="mt-4 max-w-2xl leading-7 text-[var(--text-secondary)]">
        {description}
      </p>

      <div className="mt-8 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-secondary)] p-10 text-center text-sm text-[var(--text-secondary)]">
        This module will be connected in the next development phase.
      </div>
    </section>
  );
}

export default PlaceholderPage;
