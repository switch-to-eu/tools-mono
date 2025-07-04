"use client";

import { useState, useEffect, useCallback } from "react";

const ACCEPTANCE_KEY = "nully-acceptance-state";

interface AcceptanceState {
    policyAccepted: boolean;
    agreementAccepted: boolean;
}

const initialState: AcceptanceState = {
    policyAccepted: false,
    agreementAccepted: false,
};

export function usePolicyAcceptance() {
    const [acceptanceState, setAcceptanceState] =
        useState<AcceptanceState>(initialState);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        try {
            const storedValue = localStorage.getItem(ACCEPTANCE_KEY);
            if (storedValue) {
                setAcceptanceState(JSON.parse(storedValue));
            }
        } catch (error) {
            console.error("Failed to read from localStorage", error);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    const setAcceptance = useCallback(
        (values: Partial<AcceptanceState>) => {
            try {
                const newState = { ...acceptanceState, ...values };
                localStorage.setItem(ACCEPTANCE_KEY, JSON.stringify(newState));
                setAcceptanceState(newState);
            } catch (error) {
                console.error("Failed to write to localStorage", error);
            }
        },
        [acceptanceState]
    );

    const hasAcceptedAll =
        acceptanceState.policyAccepted && acceptanceState.agreementAccepted;

    return { acceptanceState, setAcceptance, hasAcceptedAll, isLoaded };
}