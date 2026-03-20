import Link from "next/link";
import {
  AUTH_LOGIN_PATH,
  AUTH_SIGNUP_PATH,
} from "@/lib/auth/config";
import { Logo } from "@/components/layout/Logo";

function IconLearn(props: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
      aria-hidden
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <path d="M8 7h8M8 11h6" />
    </svg>
  );
}

function IconProgress(props: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
      aria-hidden
    >
      <path d="M3 3v18h18" />
      <path d="M7 12l4 4 8-8" />
    </svg>
  );
}

function IconShield(props: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
      aria-hidden
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

const features = [
  {
    title: "Structured learning",
    description:
      "Follow modules built for clarity—lessons, media, and quizzes in one guided path.",
    Icon: IconLearn,
  },
  {
    title: "Progress you can see",
    description:
      "Track completion and compliance at a glance so nothing important slips through.",
    Icon: IconProgress,
  },
  {
    title: "Built for your team",
    description:
      "A secure, internal portal—sign in, train, and stay aligned with organization standards.",
    Icon: IconShield,
  },
] as const;

export function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-gradient-to-b from-primary-50/80 via-white to-primary-50/40 text-primary-900">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden
      >
        <div
          className="absolute -left-32 top-20 h-[28rem] w-[28rem] rounded-full bg-gradient-to-br from-primary-200/50 to-primary-400/20 blur-3xl motion-reduce:animate-none animate-landing-float"
        />
        <div
          className="absolute -right-24 top-40 h-[22rem] w-[22rem] rounded-full bg-gradient-to-bl from-accent-200/40 to-primary-300/25 blur-3xl motion-reduce:animate-none animate-landing-float-slow"
        />
        <div
          className="absolute bottom-20 left-1/3 h-64 w-64 rounded-full bg-primary-100/60 blur-2xl motion-reduce:animate-none animate-landing-float"
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(13_148_136/0.06)_1px,transparent_0)] [background-size:40px_40px] motion-reduce:opacity-100 opacity-80"
        />
      </div>

      <header className="sticky top-0 z-50 border-b border-primary-100/80 bg-white/75 backdrop-blur-md motion-reduce:animate-none animate-landing-fade-in">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Logo href="/" height={44} />
          <nav
            className="flex items-center gap-2 sm:gap-3"
            aria-label="Main"
          >
            <Link
              href={AUTH_LOGIN_PATH}
              className="rounded-lg px-3 py-2 text-sm font-medium text-primary-800 transition hover:bg-primary-50 hover:text-primary-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            >
              Sign in
            </Link>
            <Link
              href={AUTH_SIGNUP_PATH}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main className="relative flex-1">
        <section
          className="mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:px-8 lg:pt-20"
          aria-labelledby="landing-hero-heading"
        >
          <div className="mx-auto max-w-3xl text-center">
            <p className="motion-reduce:animate-none animate-landing-fade-in-up text-sm font-semibold uppercase tracking-widest text-primary-600">
              Harmony Hearts Homecare
            </p>
            <h1
              id="landing-hero-heading"
              className="motion-reduce:animate-none animate-landing-fade-in-up-delay-1 mt-3 text-4xl font-bold tracking-tight text-primary-900 sm:text-5xl sm:leading-tight lg:text-6xl"
            >
              Training that feels{" "}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-primary-600 via-primary-500 to-accent-600 bg-clip-text text-transparent">
                  professional
                </span>
                <span
                  className="absolute -inset-x-1 bottom-1 -z-0 h-3 rounded bg-accent-200/60 motion-reduce:animate-none animate-landing-fade-in-delayed sm:h-4"
                  aria-hidden
                />
              </span>
              , every time.
            </h1>
            <p className="motion-reduce:animate-none animate-landing-fade-in-up-delay-2 mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-primary-700 sm:text-xl">
              Your internal learning portal for lessons, assessments, and
              compliance—designed for caregivers who deserve a calm, clear
              experience.
            </p>
            <div className="motion-reduce:animate-none animate-landing-fade-in-up-delay-3 mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <Link
                href={AUTH_LOGIN_PATH}
                className="inline-flex w-full min-w-[200px] items-center justify-center rounded-xl bg-primary-600 px-8 py-3.5 text-base font-semibold text-white shadow-md shadow-primary-600/20 transition hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-600/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 sm:w-auto"
              >
                Sign in to portal
              </Link>
              <Link
                href={AUTH_SIGNUP_PATH}
                className="inline-flex w-full min-w-[200px] items-center justify-center rounded-xl border-2 border-primary-200 bg-white/80 px-8 py-3.5 text-base font-semibold text-primary-800 backdrop-blur-sm transition hover:border-primary-300 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 sm:w-auto"
              >
                Create account
              </Link>
            </div>
          </div>

          <div className="motion-reduce:animate-none animate-landing-fade-in-up-delay-4 mx-auto mt-16 max-w-4xl">
            <div className="relative rounded-2xl border border-primary-200/80 bg-white/90 p-1 shadow-xl shadow-primary-900/5 backdrop-blur-sm transition duration-500 hover:shadow-2xl hover:shadow-primary-900/8">
              <div className="absolute inset-x-8 -top-px h-px bg-gradient-to-r from-transparent via-primary-300 to-transparent opacity-80" />
              <div className="overflow-hidden rounded-xl bg-gradient-to-br from-primary-50/90 via-white to-accent-50/30 px-6 py-8 sm:px-10 sm:py-10">
                <div className="grid gap-8 sm:grid-cols-3 sm:gap-6">
                  <div className="text-center sm:text-left">
                    <p className="text-3xl font-bold tabular-nums text-primary-800 sm:text-4xl">
                      100%
                    </p>
                    <p className="mt-1 text-sm font-medium text-primary-600">
                      In-app experience
                    </p>
                    <p className="mt-2 text-sm text-primary-700/90">
                      One place for modules, media, and quizzes.
                    </p>
                  </div>
                  <div className="text-center sm:border-x sm:border-primary-100 sm:px-6">
                    <p className="text-3xl font-bold tabular-nums text-primary-800 sm:text-4xl">
                      24/7
                    </p>
                    <p className="mt-1 text-sm font-medium text-primary-600">
                      Learn on your schedule
                    </p>
                    <p className="mt-2 text-sm text-primary-700/90">
                      Pick up where you left off, on any device.
                    </p>
                  </div>
                  <div className="text-center sm:text-right">
                    <p className="text-3xl font-bold tabular-nums text-primary-800 sm:text-4xl">
                      Secure
                    </p>
                    <p className="mt-1 text-sm font-medium text-primary-600">
                      Role-aware access
                    </p>
                    <p className="mt-2 text-sm text-primary-700/90">
                      Staff and admin flows tailored to your role.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          className="border-y border-primary-100/80 bg-white/50 py-16 backdrop-blur-sm sm:py-20"
          aria-labelledby="landing-features-heading"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2
                id="landing-features-heading"
                className="text-2xl font-bold text-primary-900 sm:text-3xl"
              >
                Everything your team expects from a modern LMS
              </h2>
              <p className="mt-3 text-primary-700">
                Familiar patterns, thoughtful visuals, and a palette that matches
                the rest of the portal.
              </p>
            </div>
            <ul className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {features.map(({ title, description, Icon }) => (
                <li key={title}>
                  <article className="group relative h-full rounded-2xl border border-primary-200/90 bg-white/90 p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary-300 hover:shadow-lg hover:shadow-primary-900/5 motion-reduce:transform-none">
                    <div className="mb-4 inline-flex rounded-xl bg-primary-50 p-3 text-primary-600 transition group-hover:bg-primary-100 group-hover:text-primary-700">
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-lg font-semibold text-primary-900">
                      {title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-primary-700">
                      {description}
                    </p>
                  </article>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
          aria-labelledby="landing-cta-heading"
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-800 via-primary-700 to-primary-900 px-6 py-12 text-center shadow-xl sm:px-12 sm:py-16">
            <div
              className="pointer-events-none absolute inset-0 opacity-30 motion-reduce:animate-none animate-landing-shimmer bg-[linear-gradient(110deg,transparent_0%,rgb(255_255_255/0.08)_50%,transparent_100%)] bg-[length:200%_100%]"
              aria-hidden
            />
            <div className="relative">
              <p className="text-sm font-semibold uppercase tracking-wider text-primary-200">
                Ready when you are
              </p>
              <h2
                id="landing-cta-heading"
                className="mt-3 text-2xl font-bold text-white sm:text-3xl"
              >
                Step into the training portal
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-primary-100">
                Use your organization credentials to sign in, or register if
                your administrator has enabled self sign-up.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                <Link
                  href={AUTH_LOGIN_PATH}
                  className="inline-flex min-w-[200px] items-center justify-center rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-primary-800 shadow-lg transition hover:bg-primary-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-800"
                >
                  Sign in
                </Link>
                <Link
                  href={AUTH_SIGNUP_PATH}
                  className="inline-flex min-w-[200px] items-center justify-center rounded-xl border-2 border-primary-400/60 bg-transparent px-8 py-3.5 text-base font-semibold text-white transition hover:border-accent-300 hover:bg-primary-600/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-200 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-800"
                >
                  Sign up
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-primary-100 bg-white/80 py-8 text-center text-sm text-primary-600 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Logo height={36} className="mx-auto opacity-90" />
          <p className="mt-3 font-medium text-primary-800">
            Harmony Hearts Homecare — Training Portal
          </p>
          <p className="mt-1 text-primary-600">
            Internal use. Questions? Contact your administrator.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <Link
              href={AUTH_LOGIN_PATH}
              className="font-medium text-primary-600 hover:text-primary-800 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded"
            >
              Sign in
            </Link>
            <Link
              href={AUTH_SIGNUP_PATH}
              className="font-medium text-primary-600 hover:text-primary-800 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded"
            >
              Sign up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
