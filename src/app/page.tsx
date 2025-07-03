import "../styles/reset.css";
import "../styles/theme.css";
import Header from "../components/layout/Header";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Header />
      <div className="bg-primary text-white p-4">Welcome to the homepage!</div>
    </main>
  );
}
