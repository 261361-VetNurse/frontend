import { redirect } from "next/navigation";

export default function Home() {
  return redirect("/pet-owners/login-page");
}