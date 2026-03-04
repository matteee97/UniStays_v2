import { SignUp } from "@clerk/clerk-react";

export default function SignUpForm() {
  return (
    <SignUp
      path="/registrati"
      routing="path"
      signInUrl="/accedi"
      appearance={{
        elements: {
          rootBox: "w-full",
          card: "shadow-none bg-transparent",
          headerTitle: "hidden",
          headerSubtitle: "hidden",
          socialButtonsBlockButton:
            "bg-white border-2 border-gray-200 hover:border-[#228E8D] hover:bg-[#D4F1EF]/50 transition-all duration-200",
          formButtonPrimary:
            "bg-[#228E8D] hover:bg-[#1A6B6A] text-white font-semibold py-2.5 transition-all duration-200 shadow-lg hover:shadow-xl",
          formFieldInput:
            "border-2 border-gray-200 focus:border-[#228E8D] focus:ring-2 focus:ring-[#228E8D]/20 transition-all duration-200",
          formFieldLabel: "text-gray-700 font-medium",
          footerActionLink: "text-[#228E8D] hover:text-[#1A6B6A] font-semibold",
          identityPreviewText: "text-gray-700",
          identityPreviewEditButton: "text-[#228E8D] hover:text-[#1A6B6A]",
          dividerLine: "bg-gray-200",
          dividerText: "text-gray-500",
        },
        variables: {
          colorPrimary: "#228E8D",
          colorText: "#1F2937",
          colorTextSecondary: "#6B7280",
          colorInputBackground: "#FFFFFF",
          colorInputText: "#1F2937",
          borderRadius: "0.75rem",
        },
      }}
    />
  );
}
