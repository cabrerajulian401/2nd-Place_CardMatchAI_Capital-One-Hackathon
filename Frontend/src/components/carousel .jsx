import {
  SiAmericanexpress,
  SiChase,
  SiBankofamerica,
  SiWellsfargo,
  SiGoldmansachs,
  SiBarclays
} from "react-icons/si";
import { FaCcDiscover } from "react-icons/fa";


const brands = [
  { icon: SiAmericanexpress, name: "American Express" },
  { icon: SiChase, name: "Chase" },
  { icon: FaCcDiscover, name: "Discover" },
  { icon: SiBankofamerica, name: "Bank of America" },
  { icon: SiWellsfargo, name: "Wells Fargo" },
  { icon: SiGoldmansachs, name: "Goldman Sachs" },
  { icon: SiBarclays, name: "Barclays" }
];

const Carousel = () => {
  return (
    <div className="w-full h-24 bg-gray-950 items-center justify-center overflow-hidden relative border-b border-gray-700">
      <div className="absolute mt-6 flex gap-16 animate-slide whitespace-nowrap px-8">
        {[...brands, ...brands].map(({ icon: Icon, name }, i) => (
          <div
            key={i}
            className="text-gray-600 text-4xl flex-shrink-0 w-32 flex justify-center items-center hover:scale-110 transition-transform duration-300 cursor-pointer"
            title={name}
          >
            <Icon size={48} />
          </div>
        ))}
      </div>

      {/* Animation styles */}
      <style>
        {`
          @keyframes slide {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }

          .animate-slide {
            animation: slide 20s linear infinite;
          }
        `}
      </style>
    </div>
  );
};

export default Carousel;
