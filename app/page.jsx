const Home = () => {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-2 p-6">
      <p className="accent-text">next.js shell</p>
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
        The shell renders
      </h1>
      <p className="text-neutral-700 dark:text-neutral-300">
        Global styles, Tailwind and the Redux Provider are wired up.
      </p>
    </main>
  );
};

export default Home;
