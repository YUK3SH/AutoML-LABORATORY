import React from "react";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-white text-gray-900">

      {/* HERO SECTION WITH UNSPLASH BACKGROUND */}
      <section
        className="w-full h-[75vh] bg-cover bg-center relative flex items-center justify-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')"
        }}
      >
        {/* Overlay for better text visibility */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

        <div className="relative text-center text-white px-6">
          <h1 className="text-5xl font-bold mb-3 drop-shadow-xl">AutoML</h1>

          <p className="text-lg mb-8 opacity-90 drop-shadow-lg">
            Driven web platform for end to end data analysis and decision support
          </p>

          <button
            onClick={() => navigate("/h2o")}
            className="
              px-8 py-3 text-lg
              bg-white text-black
              rounded-full font-medium
              hover:bg-gray-200 transition shadow-lg
            "
          >
            Get Started
          </button>
        </div>
      </section>

      {/* INSIGHTS SECTION */}
      <section className="max-w-5xl mx-auto px-6 py-14">
        <h2 className="text-3xl font-semibold text-center mb-6">
          AutoML Insights
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="p-6 bg-gray-100 rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold">What is AutoML?</h3>
            <p className="text-gray-600 mt-2">
              AutoML simplifies model building by automating preprocessing,
              model selection, and hyperparameter tuning.
            </p>
          </div>

          <div className="p-6 bg-gray-100 rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold">Industry Trends</h3>
            <p className="text-gray-600 mt-2">
              Learn how AutoML is transforming healthcare, finance, security,
              and modern automation.
            </p>
          </div>

          <div className="p-6 bg-gray-100 rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold">Latest Research</h3>
            <p className="text-gray-600 mt-2">
              Stay updated with recent AutoML studies and advancements.
            </p>
          </div>

          <div className="p-6 bg-gray-100 rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold">Real-World Use Cases</h3>
            <p className="text-gray-600 mt-2">
              Explore real-world applications powered by automated ML systems.
            </p>
          </div>
        </div>
      </section>

      <footer className="w-full py-8 text-center text-gray-500">
        © 2025 AutoML Platform — All Rights Reserved
      </footer>
    </div>
  );
}

export default HomePage;
