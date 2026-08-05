import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-32 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-muted rounded-2xl flex items-center justify-center text-4xl mb-6">
          404
        </div>
        <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-4">
          Page Not Found
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto mb-8">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link href="/">
          <Button size="lg">Return to Homepage</Button>
        </Link>
      </div>
    </Layout>
  );
}
