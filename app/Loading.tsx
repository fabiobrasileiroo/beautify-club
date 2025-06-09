// app/loading.tsx
import Lottie from "lottie-react";
import salonLoading from "./(landing)/salon.json"; // ajuste o caminho conforme necessário

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-24 h-24 sm:w-20 sm:h-20 md:w-32 md:h-32">
        <Lottie animationData={salonLoading} loop={true} />
        Carregando...
      </div>
    </div>
  );
}
