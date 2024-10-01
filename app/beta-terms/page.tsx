"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from "@/libs/supabase-client";

import { useGetUser } from "@/hooks";
import config from "@/config";

export default function BetaTerms() {
    const supabase = createClient();
    const user = useGetUser();
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [agreed, setAgreed] = useState<boolean>(false);

    const terms = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
    
    const handleModalOpen = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        setModalOpen(true);
    };

    const acceptedTerms = async () => {
        if (!user) return;

        const { data, error } = await supabase
            .from('profiles')
            .update({ agreed_to_beta_terms: agreed })
            .eq('id', user.id);

        if (error) {
            console.error('Failed to update terms agreement:', error);
            return;
        }

        if (!data) {
            console.log("Data is null: Did not update user info correctly");
            //return;
        }

        console.log('Agreement status updated:', data);
        
        // Redirect the user
        window.location.href = `${config.auth.callbackUrl}`;
    };

    return (
        <main className="max-w-4xl mx-auto pt-16 px-6">
            <h1 className="text-3xl font-semibold leading-9 text-center mb-6">Welcome to Wai</h1>
            <p className="text-lg text-center mb-4">
                While we are in the private beta phase of the project we are inviting parents to join if
                they'd like to help test and improve the Wai. We'll occasionally reach out to you for
                feedback, feature requests, and to report any issues you may have. Please take a
                moment to read the terms and conditions below.
            </p>

            <div className="flex items-center justify-center mb-4">
                <input 
                    id="termsCheckbox" 
                    type="checkbox" 
                    checked={agreed} 
                    onChange={e => setAgreed(e.target.checked)} 
                    className="w-6 h-6 mr-2"
                />
                <label htmlFor="termsCheckbox" className="text-lg">
                    I agree to the <a onClick={handleModalOpen} className="text-blue-600 underline cursor-pointer">terms and conditions</a>
                </label>
            </div>

            {modalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(200, 200, 200)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '20px'
                }}>
                    <div style={{
                        backgroundColor: 'white', 
                        boxShadow: 'rgba(0, 0, 0, 0.3) 0px 10px 20px',
                        padding: '50px',
                        borderRadius: '16px',
                        maxWidth: '600px', 
                        width: '100%', 
                        position: 'relative',
                        overflowY: 'auto',
                        maxHeight: '80vh'
                    }}>
                        <h2 style={{ 
                            fontSize: '32px',
                            fontWeight: 'bold', 
                            marginBottom: '20px',
                            textAlign: 'center'
                        }}>Terms and Conditions</h2>
                        <p style={{ 
                            fontSize: '20px',
                            lineHeight: '1.6'
                        }}>
                             <>
                                {terms}
                                <br /><br />
                                {terms}
                            </>
                        </p>
                        <button onClick={() => setModalOpen(false)} style={{ 
                            position: 'absolute', top: '15px', right: '25px',
                            background: 'none',
                            border: 'none',
                            fontSize: '36px',
                            color: '#333',
                            cursor: 'pointer'
                        }}>×</button>
                        <div 
                        style={{ 
                            marginTop: '30px',
                            textAlign: 'center'
                        }}>
                            <button 
                                onClick={() => setModalOpen(false)}
                                className={`bg-blue-500 text-white font-bold py-2 px-4 rounded`}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <button 
                    onClick={() => acceptedTerms()}
                    disabled={!agreed} 
                    className={`bg-blue-500 text-white font-bold py-2 px-4 rounded ${!agreed && !modalOpen ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    Start talking
                </button>
            </div>
        </main>
    );
}
