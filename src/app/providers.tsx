import { TRPCReactProvider } from "@/__rpc/react";
import { ClerkProvider } from "@clerk/nextjs";
export default function Providers(props: { children: React.ReactNode }) {
  return (
    <TRPCReactProvider>
      <ClerkProvider afterSignOutUrl="/">{props.children}</ClerkProvider>
    </TRPCReactProvider>
  );
}
