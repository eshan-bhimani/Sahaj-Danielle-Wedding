import { FloralDivider } from "./Floral";

export default function Footer() {
  return (
    <footer className="mt-auto bg-blue-pale/60 px-4 pb-10 pt-12 text-center">
      <FloralDivider className="mb-6" />
      <p className="font-serif text-4xl tracking-[0.2em] text-blue-deep">
        D&amp;S
      </p>
      <div className="mx-auto mt-3 h-px w-24 bg-magenta" />
      <p className="mt-3 font-serif text-lg tracking-[0.25em] text-ink">
        5.20&ndash;22.2027
      </p>
      <p className="mt-6 font-script text-2xl text-magenta">
        Danielle &amp; Sahaj
      </p>
    </footer>
  );
}
