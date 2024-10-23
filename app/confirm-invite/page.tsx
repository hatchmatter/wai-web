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
 
  const terms = `BETA TERMS AND CONDITIONS OF SERVICE FOR WAI BY HATCHMATTER, LLC

EFFECTIVE DATE: [Insert Date]

NOTICE: THESE TERMS AND CONDITIONS OF SERVICE ("AGREEMENT") ARE A BINDING CONTRACT BETWEEN YOU ("YOU" OR "YOUR") AND HATCHMATTER, LLC ("HATCHMATTER" OR "WE" OR "US"). BY ACCESSING, USING, OR REGISTERING FOR THE WAI SERVICE ("SERVICE"), YOU AGREE TO BE BOUND BY THESE TERMS AND CONDITIONS OF SERVICE. PLEASE READ THESE TERMS AND CONDITIONS OF SERVICE CAREFULLY.

1. DEFINITIONS

The following definitions apply to this Agreement:
"Beta Period" means the testing period during which the Service is made available to You on a trial basis.
"Beta Software" means the Wai software application, including any updates, modifications, or enhancements thereto.
"Content" means any information, data, or materials that You provide, upload, or transmit through the Service.
"Service" means the Wai software application, including all related software, hardware, and services.

2. BETA SOFTWARE LICENSE

Hatchmatter grants You a non-exclusive, non-transferable, and revocable license to use the Beta Software during the Beta Period solely for the purpose of testing, evaluating, and providing feedback on the Service. You agree not to sublicense, assign, or transfer the Beta Software or any rights granted under this Agreement. You agree not to modify, adapt, or create derivative works of the Beta Software.

3. USE OF SERVICE

You agree to use the Service only for lawful purposes and in compliance with these Terms and Conditions of Service. You agree not to use the Service in a manner that:
infringes the rights of any third party, including intellectual property rights.
is false, misleading, or deceptive.
contains viruses, malware, or other malicious software.
interferes with or disrupts the Service or any other user's use of the Service.
You agree to comply with all applicable laws and regulations when using the Service.

4. CONTENT OWNERSHIP

You retain all ownership rights to the Content that You provide, upload, or transmit through the Service. By providing, uploading, or transmitting Content through the Service, You grant Hatchmatter a non-exclusive, worldwide, royalty-free license to use, reproduce, modify, and distribute the Content solely for the purpose of providing the Service.

5. CONFIDENTIALITY

You agree to maintain the confidentiality of all confidential information and materials provided to You by Hatchmatter, including the Beta Software and any related documentation. You agree not to disclose any confidential information or materials to any third party without the prior written consent of Hatchmatter.

6. INTELLECTUAL PROPERTY

The Beta Software and the Service, including all related intellectual property rights, are the exclusive property of Hatchmatter. You agree not to challenge or dispute Hatchmatter's ownership of the Beta Software and the Service.

7. FEEDBACK

You agree to provide Hatchmatter with feedback on the Service, including any suggestions, ideas, or recommendations for improving the Service. You agree that Hatchmatter may use and incorporate any feedback provided by You into the Service without any obligation to provide attribution or compensation.

8. TERM AND TERMINATION

The Beta Period will commence on the date You first access the Service and will continue for a period of [Insert Timeframe] or until terminated by Hatchmatter in its sole discretion. Hatchmatter may terminate this Agreement and your access to the Service at any time, with or without cause, and without liability to You.

9. DISCLAIMER OF WARRANTIES

THE SERVICE IS PROVIDED "AS-IS" AND "AS-AVAILABLE" WITHOUT ANY WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NONINFRINGEMENT. HATCHMATTER DOES NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE FROM VIRUSES, MALWARE, OR OTHER MALICIOUS SOFTWARE.

10. LIMITATION OF LIABILITY

IN NO EVENT WILL HATCHMATTER BE LIABLE TO YOU FOR ANY INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES, INCLUDING BUT NOT LIMITED TO DAMAGES FOR LOSS OF PROFITS, GOODWILL, USE, DATA, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR RELATED TO THIS AGREEMENT OR THE SERVICE. HATCHMATTER'S LIABILITY TO YOU FOR ANY DAMAGES ARISING OUT OF OR RELATED TO THIS AGREEMENT OR THE SERVICE WILL NOT EXCEED [Insert Amount].

11. GOVERNING LAW

This Agreement will be governed by and construed in accordance with the laws of [Insert State/Country]. Any disputes arising out of or related to this Agreement will be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.

12. ENTIRE AGREEMENT

This Agreement constitutes the entire agreement between You and Hatchmatter regarding the Service and supersedes all prior or contemporaneous agreements or understandings.

13. CHANGES TO TERMS AND CONDITIONS

Hatchmatter reserves the right to modify or update these Terms and Conditions of Service at any time and will email You with notice of the changes. Your continued use of the Service after any changes to these Terms and Conditions of Service will constitute Your acceptance of such changes.

BY ACCESSING, USING, OR REGISTERING FOR THE SERVICE, YOU AGREE TO BE BOUND BY THESE TERMS AND CONDITIONS OF SERVICE.`;

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
