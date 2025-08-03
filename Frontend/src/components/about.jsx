const About = () => {
  return (
    <section id="about" className="w-full bg-gradient-to-br from-gray-950 to-gray-900 text-white py-20">
      <div className="max-w-5xl mx-auto px-6 md:px-24">
        <h2 className="text-4xl md:text-5xl font-light mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-blue-500 to-blue-300">
          Credit Confidence Starts Here
        </h2>
        <p className="text-lg md:text-xl text-gray-300 mb-8 font-light leading-relaxed">
          Most people don't pick the wrong card because they're careless — they just don't have a guide.
        </p>

        <div className="text-md md:text-lg text-gray-400 space-y-4 mb-10">
          <div className="flex items-start space-x-3">
            <span className="text-red-400 text-xl">❌</span>
            <p className="font-light">Overwhelmed by interest rates, fees, points, and perks?</p>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-red-400 text-xl">❌</span>
            <p className="font-light">Don't know the tradeoff between flashy rewards and hidden costs?</p>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-red-400 text-xl">❌</span>
            <p className="font-light">Unsure which card fits *your* lifestyle — whether you're traveling, budgeting, or just starting out?</p>
          </div>
        </div>

        <div className="border-t border-gray-700 my-10 pt-10">
          <h3 className="text-2xl md:text-3xl font-light mb-6 text-white">
            We Built <span className="font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-blue-300 bg-clip-text text-transparent">CardMatch AI</span> For You.
          </h3>
          <p className="text-gray-300 mb-4 font-light leading-relaxed">
            Our smart assistant walks you through a personalized Q&A that builds your credit profile in real time.
          </p>
          <p className="text-gray-400 mb-4 font-light leading-relaxed">
            Whether you're a first-time applicant or financially savvy, CardMatch AI helps you understand the
            <strong className="text-blue-300"> tradeoffs between risk, reward, and fees</strong> — and find cards that actually match your habits.
          </p>
          <p className="text-gray-400 font-light leading-relaxed">
            Think lifestyle-first. Whether you fly weekly or dine locally, we recommend cards that fit you — not the other way around.
          </p>
        </div>

        
      </div>
    </section>
  );
};

export default About;
