import { SignIn } from "@clerk/nextjs"

export default function SignInPage() {
  return (
    <div className="w-full max-w-md">
      <SignIn
        appearance={{
          elements: {
            formButtonPrimary: "bg-accent hover:bg-accent/90 text-white",
            footerActionLink: "text-accent hover:text-accent/90",
          },
        }}
      />
    </div>
  )
}
