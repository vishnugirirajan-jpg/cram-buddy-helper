import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Award, CheckCircle, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { activateDemoPro, PRO_SEMESTER_PRICE } from "@/lib/rewards";
import { usePro } from "@/hooks/use-pro";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [
    { title: "SemPlan — Pro demo checkout" },
    { name: "description", content: "Try SemPlan Pro with a demo checkout. No real money is charged." },
    { property: "og:title", content: "SemPlan — Pro demo checkout" },
    { property: "og:description", content: "Activate demo Pro in your browser without a real payment." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: DemoCheckout,
});

function DemoCheckout() {
  const { active, ready } = usePro();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const completed = success || active;

  const pay = () => {
    try {
      activateDemoPro();
      setSuccess(true);
      setError("");
    } catch {
      setError("Pro could not be saved. Allow browser storage, then try again.");
    }
  };

  return <main className="mx-auto max-w-md px-5 py-8 space-y-8">
    <Button variant="ghost" asChild><Link to="/plan"><ArrowLeft />Back to study</Link></Button>
    <p className="border border-primary rounded-md bg-primary/10 text-primary p-4 text-sm font-semibold" role="note">Test mode - no real money is charged</p>
    {completed ? <section className="space-y-5" aria-labelledby="success-title">
      <CheckCircle className="size-12 text-primary" />
      <h1 id="success-title" className="font-display text-3xl font-bold">Pro active</h1>
      <p className="font-semibold">Demo checkout successful</p>
      <p className="text-muted-foreground">Pro is saved in this browser. You can now add more than 3 subjects.</p>
      <Button asChild className="w-full h-14 text-lg"><Link to="/plan">Continue studying</Link></Button>
    </section> : <section className="space-y-6" aria-labelledby="checkout-title">
      <Award className="size-12 text-primary" />
      <h1 id="checkout-title" className="font-display text-3xl font-bold">Pro - Rs {PRO_SEMESTER_PRICE} per semester</h1>
      <p className="text-muted-foreground">More than 3 subjects, with Pro activation saved in this browser.</p>
      <div className="flex justify-between gap-4 border-y border-border py-4"><span>Total</span><span className="font-bold">Rs {PRO_SEMESTER_PRICE}</span></div>
      <Button disabled={!ready} onClick={pay} className="w-full h-14 text-lg"><CreditCard />Pay Rs {PRO_SEMESTER_PRICE}</Button>
      {error && <p role="alert" className="text-destructive text-sm">{error}</p>}
    </section>}
  </main>;
}