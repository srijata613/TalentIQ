import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | TalentIQ",
};

export default function SignInPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#000000",
        padding: "24px",
      }}
    >
      <SignIn
        fallbackRedirectUrl="/dashboard"
        forceRedirectUrl="/dashboard"
        appearance={{
          variables: {
            colorPrimary: "#FF6129",
            colorBackground: "#111111",
            colorText: "#FFFFFF",
            colorTextSecondary: "#A1A1AA",
            colorInputBackground: "#181818",
            colorInputText: "#FFFFFF",
            borderRadius: "10px",
          },
          elements: {
            card: {
              border: "1px solid #27272A",
              boxShadow: "0 20px 40px rgba(0,0,0,0.8)",
            },
            formButtonPrimary: {
              backgroundColor: "#FF6129",
              fontSize: "0.875rem",
              fontWeight: 600,
              "&:hover": {
                backgroundColor: "#FC3B00",
              },
            },
            footerActionLink: {
              color: "#FF7145",
              "&:hover": {
                color: "#FF6129",
              },
            },
          },
        }}
      />
    </main>
  );
}