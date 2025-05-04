import { SignUp } from "@clerk/nextjs"

export default function SignUpPage() {
  return (
    <div className="w-full max-w-md">
      <SignUp
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
