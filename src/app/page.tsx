import Button from "@/components/pet-owners/shared/Button";

export default function Home() {
  return (
    <div className="flex flex-col gap-8 min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex items-center justify-center">
        <h1 className="text-4xl font-semibold text-black dark:text-zinc-50">
          สวัสดีครับ นี่คือหน้าแรกของแอปพลิเคชัน Next.js ของคุณ!
        </h1>
      </main>
      <div className="flex flex-row gap-2">
      <a href="/pet-owners/register-page">
        <Button>Go to Register Page</Button>
      </a>
      <a href="/pet-owners/home-page">
        <Button>Go to HomePage</Button>
      </a>
      </div>
    </div>
  );
}