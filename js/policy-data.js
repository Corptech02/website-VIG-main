// Policy Data Management System - Server-Side API Implementation
// Updated to use server storage instead of localStorage

class PolicyDataManager {
    constructor() {
        console.log('💾 PolicyDataManager constructor called');
        this.apiBase = '';  // Use relative URLs
        console.log('💾 Starting database initialization...');
        this.initializeDatabase();
    }

    // Initialize database with sample data if empty
    async initializeDatabase() {
        try {
            console.log('💾 Checking if policies exist on server...');
            const response = await fetch(`${this.apiBase}/api/policies`);
            console.log('💾 Server response status:', response.status);
            const data = await response.json();
            console.log('💾 Server response data:', data);

            // Handle both response formats: direct array or {success, policies} object
            let policies = [];
            if (Array.isArray(data)) {
                // Direct array response
                policies = data;
                console.log('✅ Found', policies.length, 'existing policies on server (direct array)');
            } else if (data.success && data.policies) {
                // Object with success and policies
                policies = data.policies;
                console.log('✅ Found', policies.length, 'existing policies on server (object format)');
            } else if (data.success && data.policies && data.policies.length === 0) {
                console.log('📋 Initializing policy database with sample data...');
                await this.createSampleData();
            }

            // If we found policies, they're already loaded on the server
            if (policies.length > 0) {
                console.log('💾 Server already has', policies.length, 'policies loaded');
            }
        } catch (error) {
            console.error('❌ Error checking policy database:', error);
            console.error('❌ Error details:', error.stack);
        }
    }

    // Create sample data
    async createSampleData() {
        const samplePolicies = [
            {
                id: 'policy-001',
                policy_number: 'VIG-2024-001',
                type: 'Commercial Auto Insurance',
                status: 'Active',
                premium: 12450,
                effective_date: '2024-01-15',
                expiration_date: '2025-01-15',
                carrier: 'Progressive Commercial',
                insured_name: 'ABC Trucking LLC',
                client_phone: '(555) 123-4567',
                client_email: 'john@abctrucking.com',
                address: '1234 Main St, Columbus, OH 43215',
                vehicles: [
                    {
                        year: 2020,
                        make: 'Freightliner',
                        model: 'Cascadia',
                        vin: '1FUJGBDV5LLBXXXXX',
                        weight: '80,000 lbs',
                        body_type: 'Tractor',
                        use: 'Commercial Transportation',
                        radius: 'Interstate',
                        vehicle_cost: '$125,000',
                        lien_holder: 'Freightliner Financial'
                    }
                ],
                coverage: {
                    auto_liability: {
                        combined_single_limit: '$1,000,000',
                        medical_payments: '$5,000',
                        uninsured_motorist: '$1,000,000',
                        underinsured_motorist: '$1,000,000'
                    },
                    physical_damage: {
                        comprehensive: 'Actual Cash Value',
                        collision: 'Actual Cash Value',
                        comprehensive_deductible: '$1,000',
                        collision_deductible: '$1,000'
                    }
                }
            }
        ];

        try {
            const response = await fetch(`${this.apiBase}/api/policies`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ policies: samplePolicies })
            });

            const result = await response.json();
            if (result.success) {
                console.log('✅ Sample policies created successfully');
            } else {
                console.error('❌ Failed to create sample policies:', result.error);
            }
        } catch (error) {
            console.error('❌ Error creating sample data:', error);
        }
    }

    // Get all policies
    async getAllPolicies() {
        try {
            console.log('🔍 getAllPolicies: Making request to', `${this.apiBase}/api/policies`);
            const response = await fetch(`${this.apiBase}/api/policies`);
            console.log('🔍 getAllPolicies: Response status:', response.status);
            const data = await response.json();
            console.log('🔍 getAllPolicies: Response data:', data);

            // Handle both response formats: direct array or {success, policies} object
            if (Array.isArray(data)) {
                console.log('🔍 getAllPolicies: Returning array of', data.length, 'policies');
                return data;
            } else if (data.success && data.policies) {
                console.log('🔍 getAllPolicies: Returning object.policies with', data.policies.length, 'policies');
                return data.policies;
            } else {
                console.warn('🔍 getAllPolicies: Unexpected response format from /api/policies:', data);
                return [];
            }
        } catch (error) {
            console.error('❌ getAllPolicies: Error fetching policies:', error);
            return [];
        }
    }

    // Get policy by ID
    async getPolicyById(policyId) {
        try {
            const policies = await this.getAllPolicies();
            return policies.find(p => p.id === policyId) || null;
        } catch (error) {
            console.error('❌ Error fetching policy:', error);
            return null;
        }
    }

    // Get policy by number
    async getPolicyByNumber(policyNumber) {
        try {
            const policies = await this.getAllPolicies();
            return policies.find(p => p.policy_number === policyNumber) || null;
        } catch (error) {
            console.error('❌ Error fetching policy:', error);
            return null;
        }
    }

    // Add new policy
    async addPolicy(policyData) {
        try {
            const response = await fetch(`${this.apiBase}/api/policies`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ policies: [policyData] })
            });

            const result = await response.json();
            if (result.success) {
                console.log('✅ Policy added successfully');
                return policyData;
            } else {
                console.error('❌ Failed to add policy:', result.error);
                return null;
            }
        } catch (error) {
            console.error('❌ Error adding policy:', error);
            return null;
        }
    }

    // Update policy
    async updatePolicy(policyId, updates) {
        try {
            // For now, we need to get all policies, update the specific one, and save back
            const policies = await this.getAllPolicies();
            const policyIndex = policies.findIndex(p => p.id === policyId || p.policy_number === policyId);

            if (policyIndex !== -1) {
                policies[policyIndex] = { ...policies[policyIndex], ...updates };

                const response = await fetch(`${this.apiBase}/api/policies`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ policies: policies })
                });

                const result = await response.json();
                if (result.success) {
                    console.log('✅ Policy updated successfully');
                    return policies[policyIndex];
                } else {
                    console.error('❌ Failed to update policy:', result.error);
                    return null;
                }
            }

            console.error('❌ Policy not found for update:', policyId);
            return null;
        } catch (error) {
            console.error('❌ Error updating policy:', error);
            return null;
        }
    }

    // Delete policy
    async deletePolicy(policyId) {
        try {
            const response = await fetch(`${this.apiBase}/api/policies/${policyId}`, {
                method: 'DELETE'
            });

            const result = await response.json();
            if (result.success) {
                console.log('✅ Policy deleted successfully');
                return true;
            } else {
                console.error('❌ Failed to delete policy:', result.error);
                return false;
            }
        } catch (error) {
            console.error('❌ Error deleting policy:', error);
            return false;
        }
    }

    // Authentication methods (local implementation)
    async authenticateUser(policyNumber, phoneNumber) {
        try {
            const policies = await this.getAllPolicies();
            const policy = policies.find(p =>
                p.policy_number === policyNumber &&
                p.client_phone.replace(/\D/g, '') === phoneNumber.replace(/\D/g, '')
            );

            if (policy) {
                return {
                    success: true,
                    user: {
                        name: policy.insured_name,
                        email: policy.client_email,
                        phone: policy.client_phone,
                        policy_number: policy.policy_number
                    },
                    policy: policy,
                    token: 'client_token_' + policy.id
                };
            }

            return {
                success: false,
                error: 'Invalid policy number or phone number'
            };
        } catch (error) {
            console.error('❌ Authentication error:', error);
            return {
                success: false,
                error: 'Authentication failed'
            };
        }
    }

    // Get user policies
    async getUserPolicies(policyNumber) {
        try {
            const policies = await this.getAllPolicies();
            return policies.filter(p => p.policy_number === policyNumber);
        } catch (error) {
            console.error('❌ Error fetching user policies:', error);
            return [];
        }
    }

    // Clear database and reinitialize
    async clearAll() {
        try {
            // Get all policies and delete them
            const policies = await this.getAllPolicies();
            for (const policy of policies) {
                await this.deletePolicy(policy.id);
            }
            console.log('🔄 Policy database cleared');
        } catch (error) {
            console.error('❌ Error clearing database:', error);
        }
    }

    // Search functionality
    async searchPolicies(searchTerm) {
        try {
            const policies = await this.getAllPolicies();
            const term = searchTerm.toLowerCase();

            return policies.filter(policy =>
                policy.policy_number.toLowerCase().includes(term) ||
                policy.insured_name.toLowerCase().includes(term) ||
                policy.client_email.toLowerCase().includes(term) ||
                policy.client_phone.includes(term) ||
                policy.carrier.toLowerCase().includes(term) ||
                policy.type.toLowerCase().includes(term)
            );
        } catch (error) {
            console.error('❌ Error searching policies:', error);
            return [];
        }
    }

    // Statistics
    async getStatistics() {
        try {
            const policies = await this.getAllPolicies();

            const totalPolicies = policies.length;
            const activePolicies = policies.filter(p => p.status === 'Active').length;
            const uniqueClients = new Set(policies.map(p => p.insured_name)).size;

            // Calculate expiring soon (next 60 days)
            const today = new Date();
            const expiringSoon = policies.filter(p => {
                const expDate = new Date(p.expiration_date);
                const diffTime = expDate - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays <= 60 && diffDays >= 0;
            }).length;

            return {
                totalPolicies,
                activePolicies,
                uniqueClients,
                expiringSoon
            };
        } catch (error) {
            console.error('❌ Error getting statistics:', error);
            return {
                totalPolicies: 0,
                activePolicies: 0,
                uniqueClients: 0,
                expiringSoon: 0
            };
        }
    }

    // Refresh display (compatibility method)
    async refreshDisplay() {
        // This method exists for compatibility with existing code
        // The actual display refresh should be handled by the UI components
        console.log('🔄 Policy display refresh requested');
    }
}

// Global instance
try {
    console.log('🚀 Initializing PolicyDataManager...');
    window.policyDB = new PolicyDataManager();
    console.log('✅ Policy Data Manager initialized - Server-side storage ready');
    console.log('💾 PolicyDataManager available at window.policyDB:', !!window.policyDB);
} catch (error) {
    console.error('❌ Failed to initialize PolicyDataManager:', error);
    console.error('❌ Error stack:', error.stack);
}