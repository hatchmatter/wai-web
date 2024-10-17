"use client";

import { redirect, useSearchParams } from "next/navigation";
import React, { useState } from "react";

import Modal from "@/components/ModalBetaTerms";

export default function ConfirmInvite() {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const searchParams = useSearchParams();
  const token = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const title = "Terms and Conditions";
  const terms = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

  if (!token || !type) {
    redirect("/");
  }

  const handleModalOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setModalOpen(true);
  };

  const confirmInvite = (e: any) => {
    e.preventDefault();

    if (agreedToTerms) {
      window.location.href = `/api/auth/confirm?token_hash=${token}&type=${type}&agreed_to_beta_terms="true"`;
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen px-4">
      <div className="max-w-4xl w-full">
        <h1 className="text-3xl font-semibold leading-9 text-center mb-6">
          Welcome to Wai
        </h1>
        <p className="text-lg text-center mb-4">
          While we are in the private beta phase of the project we are inviting
          parents to join if they'd like to help test and improve the Wai. We'll
          occasionally reach out to you for feedback, feature requests, and to
          report any issues you may have. Please take a moment to read the terms
          and conditions below.
        </p>

        <div className="flex items-center justify-center mb-4 space-x-4">
          <form onSubmit={confirmInvite}>
            <input
              id="termsCheckbox"
              type="checkbox"
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="checkbox align-middle"
            />
            <label
              htmlFor="termsCheckbox"
              className="text-lg align-middle ml-3"
            >
              I agree to the{" "}
              <button
                onClick={handleModalOpen}
                className="text-blue-600 underline appearance-none border-none bg-transparent p-0 cursor-pointer focus:outline-none focus:ring-0"
              >
                terms and conditions
              </button>
            </label>
            <button
              type="submit"
              disabled={!agreedToTerms}
              className="btn btn-primary btn-block mt-4"
            >
              Confirm
            </button>
          </form>
        </div>
      </div>

      <Modal isModalOpen={modalOpen} setIsModalOpen={setModalOpen} title={title} text={terms} />
    </main>
  );
}
