import Head from "next/head";

export default function Home() {
  return (
    <div>
      <Head>
        <title>Boardly</title>
        <meta name="description" content="Welcome to Boardly" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="text-4xl font-bold">Boardly</h1>
        <p>Welcome to Boardly, your collaborative board application.</p>
      </main>
    </div>
  );
}
