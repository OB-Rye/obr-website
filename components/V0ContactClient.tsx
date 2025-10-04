<div className="pt-6">
  <button
    type="submit"
    title="Send Message"
    disabled={loading}
    className="
      btn-primary w-full
      transition duration-300 ease-in-out
      hover:bg-blue-700 hover:scale-105 hover:-translate-y-0.5 hover:shadow-xl
      focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-white
      active:scale-[0.97]
      disabled:opacity-60 disabled:cursor-not-allowed
    "
    onClick={(e) => {
      if (!loading) e.currentTarget.form?.requestSubmit?.();
    }}
  >
    {loading ? "Sending…" : "Send Message"}
  </button>
</div>
