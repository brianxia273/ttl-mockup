export default function Hero() {
  return (
    <section className="hero">
      <h1>Toy Library</h1>
      <p>Browse and borrow toys adapted by Cornell Assistive Technologies.</p>
      <div className="hero-actions">
        <a className="btn btn-primary" href="#">
          Learn More About CAT
        </a>
        <a
          className="btn btn-white"
          href="mailto:assistivetech@cornell.edu?subject=Custom%20toy%20request"
        >
          Request a Custom Toy
        </a>
      </div>
    </section>
  );
}
