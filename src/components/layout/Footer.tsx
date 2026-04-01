import React from "react";

const Footer = () => {
  return (
    <footer className="mt-auto border-t">
      <div className="container mx-auto px-4 sm:px-6 py-6">
        <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
          This tool provides estimates for illustrative purposes only and does not constitute financial advice.
          Actual outcomes may vary based on market conditions, tax laws, and personal circumstances.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
