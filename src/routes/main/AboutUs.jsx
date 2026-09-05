import React from "react";

const AboutUs = () => {
  return (
    <main className="px-4 py-16 max-w-5xl mx-auto">
      <header className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-black text-neutral-900 dark:text-neutral-100 mb-4">
          A platform made by UniMe students — for UniMe students.
        </h1>
        <p className="text-neutral-700 dark:text-neutral-300 max-w-2xl mx-auto">
          We're building a space where learning, collaboration, and community come together.
        </p>
      </header>

      <section className="mb-12 bg-white dark:bg-neutral-900 rounded-2xl p-6 sm:p-10 border border-neutral-200 dark:border-neutral-700">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">Our Story</h2>
        <div className="text-neutral-700 dark:text-neutral-300 space-y-4">
          <p>
            The idea for Unime.Space existed before the name itself. It started when I noticed that my friends struggled to pass the DSA exam. I decided to build a website to help them prepare, which led to the creation of the original project, Metame.it.
          </p>
          <p>
            The site ran for a few months and gained modest traction, reaching around 1,000+ visits during its lifetime. However, when the exam format changed, the project lost relevance. At the same time, I was heavily focused on my own exams, so development stopped. I also failed to renew the server monthly plan and pay the due bills, which resulted in the loss of most of the database.
          </p>
          <p>
            This year, I decided to revive the project — not as a simple reboot, but as a more serious and scalable platform with a new identity. The goal shifted from a solo project to a team-driven effort, which is when I decided to start building a team. One of the first people I could rely on was my friend Muhammadyunus.
          </p>
          <p className="italic text-neutral-600 dark:text-neutral-400">
            — Meromah
          </p>
        </div>
      </section>

      <section className="mb-12 bg-white dark:bg-neutral-900 rounded-2xl p-6 sm:p-10 border border-neutral-200 dark:border-neutral-700">
        <div className="text-neutral-700 dark:text-neutral-300 space-y-4">
          <p>
            Unime.Space really started to make sense when Meromah said we should stop trying to fix the old version and just make something different. Like, actually different. The idea was bigger and honestly harder to build, but it felt stronger overall — the concept was better, it would work better, feel better to use, be faster, and safer too.
          </p>
          <p>
            If it works the way we want, the platform would help students study for coding exams way more easily, and not just coding, but pretty much any exam. The old version was mostly based on tests made and hard-coded by the site admin, and that was kinda limiting. With Unime.Space, the idea is to let students control the content, while the platform itself stays in one place.
          </p>
          <p>
            So you'd have tests, quizzes, coding questions, MCQs, and also a social space where students can post stuff, share files, upload photos of their notes, talk about exams, make their own tests, comment, and ask for help without it feeling complicated or awkward.
          </p>
          <p className="italic text-neutral-600 dark:text-neutral-400">
            — Muhammadyunus
          </p>
        </div>
      </section>

      <section className="bg-white dark:bg-neutral-900 rounded-2xl p-6 sm:p-10 border border-neutral-200 dark:border-neutral-700">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">Acknowledgement</h2>
        <div className="text-neutral-700 dark:text-neutral-300 space-y-4">
          <p>
            Thanks to our friend <a 
              href="https://www.linkedin.com/in/abdurakhmon013" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary-blue dark:text-blue-400 hover:underline font-medium"
            >
              Abdurahmon
            </a> for creating the UnimeSpace logo. When we asked if he could help us design a logo, he didn't hesitate to say yes. He worked hard to create something unique and memorable that perfectly captures the spirit of our platform. We're grateful for his talent, dedication, and friendship.
          </p>
          <p>
            A special shoutout to <strong className="text-neutral-900 dark:text-neutral-100">Khojiakbar</strong> — our emotional support human and resident morale booster. He kept us laughing when we were drowning in deadlines, cheered us on during our most sleep-deprived moments, and somehow managed to convince us that yes, this project was actually going to work (even when we had our doubts). Without his infectious positivity and ability to find humor in our most chaotic moments, we might have given up and become farmers instead. Thanks for being our cheerleader (💃) and keeping our spirits high, Khojiakbar! 🎉
          </p>
        </div>
      </section>
    </main>
  );
};

export default AboutUs;


