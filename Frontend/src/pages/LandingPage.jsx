import NavBar from "../components/navbar";
import Hero from "../components/hero";
import Carousel from "../components/carousel ";
import About from "../components/about";
import { Link } from "react-router-dom";
import { FaAngleRight } from "react-icons/fa";

const LandingPage = () => {
  return (
    <>
      <NavBar />
      <Hero />
      <Carousel />
      <section className="w-full h-screen bg-gray-950 flex items-center justify-center px-6">
        <div className="text-center max-w-3xl">
          <h1 className="text-4xl  font-light text-white mb-8 leading-tight">
            Credit Cards Are Confusing <br className="hidden md:block" /> —{" "}
            <br className="hidden md:block" />
            We Make Them Make Sense
          </h1>
          <p className="text-lg text-gray-400 mb-12 font-light">
            Discover the card that fits your lifestyle, financial goals, and
            spending habits — all with one simple conversation.
          </p>
          <Link
            to="/questionnaire"
            className="inline-flex items-center gap-3 text-md font-medium px-8 py-4 rounded-full bg-white text-gray-900 hover:bg-gray-200 transition duration-200"
          >
            Find Your Match <FaAngleRight className="text-xl" />
          </Link>
        </div>
      </section>
      <About />
    </>
  );
};

export default LandingPage;
