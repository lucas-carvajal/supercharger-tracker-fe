export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-white dark:bg-black">
      <main className="flex flex-col items-center gap-4 text-center px-8">
        <h1 className="text-6xl font-bold tracking-tight text-black dark:text-white sm:text-8xl">
          Soonercharger
        </h1>
        <p className="text-xl text-zinc-500 dark:text-zinc-400 sm:text-2xl">
          Track the expansion of the worlds&apos; biggest charging network
        </p>
      </main>
    </div>
  );
}
