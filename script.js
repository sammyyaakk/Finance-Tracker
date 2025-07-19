        // Global variables
        let entries = JSON.parse(localStorage.getItem('financeEntries') || '[]');
        let currentView = 'dashboard';
        let currentDate = new Date();
        let editingEntryId = null;
        let chartInstance = null;

        // Comprehensive category keywords for AI parsing
        const categoryKeywords = {
            food: [
                // Restaurants & Fast Food
                'restaurant', 'mcdonald', 'mcdonalds', 'burger king', 'kfc', 'taco bell', 'subway', 'pizza hut', 'dominos', 'chipotle', 'starbucks', 'dunkin', 'wendys', 'chick-fil-a', 'in-n-out', 'five guys',
                // Food Types
                'food', 'lunch', 'dinner', 'breakfast', 'brunch', 'snack', 'meal', 'eat', 'ate', 'coffee', 'drink', 'pizza', 'burger', 'sandwich', 'salad', 'soup', 'pasta', 'sushi', 'chinese', 'mexican', 'italian', 'thai', 'indian',
                // Grocery & Shopping
                'grocery', 'groceries', 'supermarket', 'walmart', 'target', 'costco', 'safeway', 'kroger', 'whole foods', 'trader joe', 'market', 'deli', 'bakery', 'butcher',
                // Delivery
                'delivery', 'takeout', 'order', 'doordash', 'ubereats', 'grubhub', 'postmates'
            ],
            transport: [
                // Ride Services
                'uber', 'lyft', 'taxi', 'cab', 'ride', 'rideshare',
                // Public Transport
                'bus', 'train', 'metro', 'subway', 'rail', 'transit', 'commute', 'fare', 'ticket',
                // Vehicle Expenses
                'gas', 'fuel', 'gasoline', 'petrol', 'oil', 'maintenance', 'repair', 'mechanic', 'car wash', 'registration', 'inspection',
                // Parking & Tolls
                'parking', 'toll', 'bridge', 'meter', 'garage', 'valet',
                // Vehicle Types
                'car', 'bike', 'bicycle', 'motorcycle', 'scooter', 'vehicle', 'auto', 'ola', 'rapido', 'careem'
            ],
            entertainment: [
                // Movies & Shows
                'movie', 'cinema', 'theater', 'film', 'netflix', 'hulu', 'disney', 'amazon prime', 'hbo', 'streaming',
                // Music
                'music', 'spotify', 'apple music', 'concert', 'show', 'band', 'festival', 'album', 'vinyl',
                // Gaming
                'game', 'gaming', 'xbox', 'playstation', 'nintendo', 'steam', 'twitch', 'esports',
                // Activities
                'party', 'bar', 'club', 'pub', 'drinks', 'entertainment', 'fun', 'activity', 'hobby', 'sport', 'bowling', 'pool', 'arcade',
                // Books & Media
                'book', 'magazine', 'newspaper', 'kindle', 'audible'
            ],
            shopping: [
                // Online Shopping
                'amazon', 'ebay', 'etsy', 'shop', 'shopping', 'buy', 'bought', 'purchase', 'order', 'online',
                // Clothing & Fashion
                'clothes', 'clothing', 'shirt', 'pants', 'dress', 'shoes', 'sneakers', 'boots', 'jacket', 'coat', 'hat', 'accessories', 'jewelry', 'watch', 'bag', 'purse',
                // Electronics
                'electronics', 'phone', 'computer', 'laptop', 'tablet', 'headphones', 'charger', 'cable', 'tv', 'monitor', 'camera',
                // Home & Garden
                'furniture', 'home', 'garden', 'tools', 'hardware', 'home depot', 'lowes', 'ikea', 'bed bath', 'decoration', 'appliance',
                // General Retail
                'store', 'mall', 'retail', 'target', 'walmart', 'costco', 'best buy', 'macys', 'nordstrom'
            ],
            bills: [
                // Utilities
                'electricity', 'electric', 'power', 'water', 'gas bill', 'heating', 'cooling', 'utilities', 'utility',
                // Communication
                'internet', 'wifi', 'phone bill', 'cell phone', 'mobile', 'verizon', 'att', 'tmobile', 'sprint', 'comcast', 'xfinity',
                // Housing
                'rent', 'rental', 'mortgage', 'lease', 'property', 'hoa', 'condo fee', 'apartment',
                // Insurance
                'insurance', 'health insurance', 'car insurance', 'auto insurance', 'life insurance', 'home insurance',
                // Subscriptions
                'subscription', 'membership', 'premium', 'monthly', 'annual', 'renewal',
                // Banking & Finance
                'bank fee', 'overdraft', 'interest', 'loan', 'credit card', 'payment', 'bill', 'statement'
            ],
            health: [
                // Medical
                'doctor', 'physician', 'medical', 'medicine', 'medication', 'prescription', 'pharmacy', 'hospital', 'clinic', 'checkup', 'appointment',
                // Dental & Vision
                'dentist', 'dental', 'teeth', 'cleaning', 'optometrist', 'glasses', 'contacts', 'eye exam',
                // Fitness & Wellness
                'gym', 'fitness', 'workout', 'trainer', 'yoga', 'pilates', 'massage', 'spa', 'therapy', 'wellness',
                // Mental Health
                'therapist', 'counseling', 'psychologist', 'psychiatrist', 'mental health',
                // Health Insurance & Copays
                'copay', 'deductible', 'health insurance', 'medical bill'
            ],
            education: [
                'school', 'tuition', 'education', 'course', 'class', 'university', 'college', 'student', 'textbook', 'supplies', 'fee', 'registration', 'learning', 'training', 'certification', 'workshop', 'seminar'
            ],
            personal: [
                'haircut', 'salon', 'barber', 'beauty', 'cosmetics', 'skincare', 'makeup', 'personal care', 'hygiene', 'toiletries', 'laundry', 'dry cleaning', 'cleaning'
            ],
            pets: [
                'pet', 'dog', 'cat', 'vet', 'veterinarian', 'pet food', 'pet store', 'grooming', 'pet supplies', 'animal'
            ],
            gifts: [
                'gift', 'present', 'birthday', 'wedding', 'anniversary', 'holiday', 'christmas', 'valentine', 'donation', 'charity', 'tip', 'gratuity'
            ],
            other: []
        };

        // Enhanced natural language parser with better categorization
        function parseEntry(text) {
            const originalText = text;
            const words = text.toLowerCase().split(/[\s,.-]+/);
            let amount = 0;
            let description = text;
            let type = 'expense';
            let category = 'other';

            // Extract amount - more flexible patterns
            const amountPatterns = [
                /\$(\d+(?:\.\d{2})?)/,  // $25 or $25.50
                /(\d+(?:\.\d{2})?)\s*dollars?/,  // 25 dollars
                /(\d+(?:\.\d{2})?)\s*bucks?/,    // 25 bucks
                /(\d+(?:\.\d{2})?)\$?/           // 25 or 25$
            ];
            
            for (const pattern of amountPatterns) {
                const match = text.match(pattern);
                if (match) {
                    amount = parseFloat(match[1]);
                    break;
                }
            }

            // Determine type with more comprehensive keywords
            const incomeKeywords = [
                'received', 'earned', 'salary', 'income', 'paid', 'deposit', 'bonus', 
                'freelance', 'wage', 'commission', 'refund', 'cashback', 'reward',
                'gift money', 'allowance', 'dividend', 'interest', 'profit', 'sold',
                'reimbursement', 'tax return', 'winning', 'prize'
            ];
            
            const expenseKeywords = [
                'spent', 'paid for', 'bought', 'purchase', 'cost', 'charge', 'fee',
                'bill for', 'subscription to', 'membership', 'tip', 'donation'
            ];

            // Check for income indicators first (more specific)
            for (const keyword of incomeKeywords) {
                if (text.toLowerCase().includes(keyword)) {
                    type = 'income';
                    break;
                }
            }

            // If not income, check expense patterns
            if (type !== 'income') {
                for (const keyword of expenseKeywords) {
                    if (text.toLowerCase().includes(keyword)) {
                        type = 'expense';
                        break;
                    }
                }
            }

            // Enhanced category detection with scoring system
            const categoryScores = {};
            
            // Initialize scores
            for (const cat of Object.keys(categoryKeywords)) {
                categoryScores[cat] = 0;
            }

            // Score each category based on keyword matches
            const textLower = text.toLowerCase();
            
            for (const [cat, keywords] of Object.entries(categoryKeywords)) {
                for (const keyword of keywords) {
                    if (textLower.includes(keyword)) {
                        // Give higher score for exact matches and longer keywords
                        const score = keyword.length * (textLower.split(keyword).length - 1);
                        categoryScores[cat] += score;
                        
                        // Bonus for multiple word matches
                        if (keyword.includes(' ')) {
                            categoryScores[cat] += 5;
                        }
                    }
                }
            }

            // Find category with highest score
            let maxScore = 0;
            for (const [cat, score] of Object.entries(categoryScores)) {
                if (score > maxScore && cat !== 'other') {
                    maxScore = score;
                    category = cat;
                }
            }

            // Additional context-based categorization
            if (category === 'other') {
                // Check for common patterns that might be missed
                if (/\b(at|from)\s+[\w\s]+restaurant|cafe|bar|grill/i.test(text)) {
                    category = 'food';
                } else if (/\b(bought|purchased|ordered)\s+[\w\s]*(clothes|shirt|pants|shoes)/i.test(text)) {
                    category = 'shopping';
                } else if (/\b(paid|bill|due|monthly)\s+[\w\s]*(electric|water|internet|phone)/i.test(text)) {
                    category = 'bills';
                } else if (/\b(trip|travel|flight|hotel|vacation)/i.test(text)) {
                    category = 'transport';
                }
            }

            // If still other, make educated guesses based on amount ranges
            if (category === 'other' && amount > 0) {
                if (amount >= 500 && amount <= 3000) {
                    // Likely rent or major bill
                    if (type === 'expense') category = 'bills';
                } else if (amount >= 1000) {
                    // Large purchase, likely shopping
                    if (type === 'expense') category = 'shopping';
                } else if (amount <= 50) {
                    // Small amount, likely food or transport
                    if (type === 'expense') category = 'food';
                }
            }

            return { amount, description, type, category };
        }

        // Add new entry
        function addEntry() {
            const input = document.getElementById('entryInput');
            const text = input.value.trim();
            
            if (!text) return;

            const parsed = parseEntry(text);
            
            if (parsed.amount === 0) {
                alert('Please include an amount in your entry (e.g., $25, 50.00)');
                return;
            }

            const entry = {
                id: Date.now(),
                date: new Date().toISOString().split('T')[0],
                time: new Date().toLocaleTimeString(),
                ...parsed
            };

            entries.unshift(entry);
            saveEntries();
            input.value = '';
            updateDisplay();
        }

        // Save entries to localStorage
        function saveEntries() {
            localStorage.setItem('financeEntries', JSON.stringify(entries));
        }

        // Delete entry
        function deleteEntry(id) {
            if (confirm('Are you sure you want to delete this entry?')) {
                entries = entries.filter(entry => entry.id !== id);
                saveEntries();
                updateDisplay();
            }
        }

        // Edit entry
        function editEntry(id) {
            const entry = entries.find(e => e.id === id);
            if (!entry) return;

            editingEntryId = id;
            document.getElementById('editDescription').value = entry.description;
            document.getElementById('editAmount').value = entry.amount;
            document.getElementById('editType').value = entry.type;
            document.getElementById('editCategory').value = entry.category;
            document.getElementById('editModal').classList.remove('hidden');
        }

        // Save edit
        function saveEdit() {
            const entry = entries.find(e => e.id === editingEntryId);
            if (!entry) return;

            entry.description = document.getElementById('editDescription').value;
            entry.amount = parseFloat(document.getElementById('editAmount').value);
            entry.type = document.getElementById('editType').value;
            entry.category = document.getElementById('editCategory').value;

            saveEntries();
            closeEditModal();
            updateDisplay();
        }

        // Close edit modal
        function closeEditModal() {
            document.getElementById('editModal').classList.add('hidden');
            editingEntryId = null;
        }

        // Switch view
        function switchView(view) {
            currentView = view;
            
            // Update nav tabs
            document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
            event.target.classList.add('active');
            
            // Hide all views
            document.querySelectorAll('[id$="View"]').forEach(view => view.classList.add('hidden'));
            
            // Show selected view
            document.getElementById(view + 'View').classList.remove('hidden');
            
            updateDisplay();
        }

        // Update display based on current view
        function updateDisplay() {
            updateStats();
            
            if (currentView === 'dashboard') {
                updateChart();
            } else if (currentView === 'entries') {
                updateEntriesList();
            } else if (currentView === 'calendar') {
                updateCalendar();
            }
        }

        // Update statistics
        function updateStats() {
            const filteredEntries = getFilteredEntries();
            
            const totalIncome = filteredEntries
                .filter(entry => entry.type === 'income')
                .reduce((sum, entry) => sum + entry.amount, 0);
                
            const totalExpenses = filteredEntries
                .filter(entry => entry.type === 'expense')
                .reduce((sum, entry) => sum + entry.amount, 0);
                
            const balance = totalIncome - totalExpenses;

            document.getElementById('totalIncome').textContent = `$${totalIncome.toFixed(2)}`;
            document.getElementById('totalExpenses').textContent = `$${totalExpenses.toFixed(2)}`;
            document.getElementById('totalBalance').textContent = `$${balance.toFixed(2)}`;
        }

        // Get filtered entries based on date range
        function getFilteredEntries() {
            const startDate = document.getElementById('startDate').value;
            const endDate = document.getElementById('endDate').value;
            
            if (!startDate && !endDate) return entries;
            
            return entries.filter(entry => {
                const entryDate = entry.date;
                if (startDate && entryDate < startDate) return false;
                if (endDate && entryDate > endDate) return false;
                return true;
            });
        }

        // Apply date filter
        function applyDateFilter() {
            updateDisplay();
        }

        // Clear date filter
        function clearDateFilter() {
            document.getElementById('startDate').value = '';
            document.getElementById('endDate').value = '';
            updateDisplay();
        }

        // Update chart
        function updateChart() {
            const filteredEntries = getFilteredEntries();
            const expenseEntries = filteredEntries.filter(entry => entry.type === 'expense');
            
            // Group by category
            const categoryTotals = {};
            expenseEntries.forEach(entry => {
                categoryTotals[entry.category] = (categoryTotals[entry.category] || 0) + entry.amount;
            });
            
            const chartData = Object.entries(categoryTotals).map(([category, amount]) => ({
                label: category.charAt(0).toUpperCase() + category.slice(1),
                data: amount,
                backgroundColor: getRandomColor(category)
            }));
            
            const ctx = document.getElementById('categoryChart').getContext('2d');
            
            if (chartInstance) {
                chartInstance.destroy();
            }
            
            chartInstance = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: chartData.map(item => item.label),
                    datasets: [{
                        data: chartData.map(item => item.data),
                        backgroundColor: chartData.map(item => item.backgroundColor),
                        borderWidth: 2,
                        borderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return context.label + ': $' + context.raw.toFixed(2);
                                }
                            }
                        }
                    }
                }
            });
        }

        // Get color for categories with more variety
        function getRandomColor(category) {
            const colors = {
                food: '#FF6384',           // Pink-red
                transport: '#36A2EB',      // Blue
                entertainment: '#FFCE56',  // Yellow
                shopping: '#4BC0C0',       // Teal
                bills: '#9966FF',          // Purple
                health: '#FF9F40',         // Orange
                education: '#8FBC8F',      // Light green
                personal: '#DDA0DD',       // Plum
                pets: '#F0E68C',           // Khaki
                gifts: '#FFB6C1',          // Light pink
                other: '#D3D3D3'           // Light gray
            };
            return colors[category] || '#' + Math.floor(Math.random()*16777215).toString(16);
        }

        // Update entries list
        function updateEntriesList() {
            const container = document.getElementById('entriesList');
            const filteredEntries = getFilteredEntries();
            
            if (filteredEntries.length === 0) {
                container.innerHTML = '<p>No entries found.</p>';
                return;
            }
            
            container.innerHTML = filteredEntries.map(entry => `
                <div class="entry-item">
                    <div class="entry-info">
                        <div class="entry-description">${entry.description}</div>
                        <div class="entry-meta">
                            ${entry.date} • ${entry.time} • ${entry.category}
                        </div>
                    </div>
                    <div class="entry-amount ${entry.type}">
                        ${entry.type === 'income' ? '+' : '-'}$${entry.amount.toFixed(2)}
                    </div>
                    <div class="entry-actions">
                        <button class="btn btn-warning btn-small" onclick="editEntry(${entry.id})">
                            ✏️
                        </button>
                        <button class="btn btn-danger btn-small" onclick="deleteEntry(${entry.id})">
                            🗑️
                        </button>
                    </div>
                </div>
            `).join('');
        }

        // Update calendar
        function updateCalendar() {
            const container = document.getElementById('calendarContainer');
            const monthNames = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"];
            
            document.getElementById('currentMonth').textContent = 
                `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
            
            const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
            const startDate = new Date(firstDay);
            startDate.setDate(startDate.getDate() - firstDay.getDay());
            
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            
            let html = days.map(day => `<div class="calendar-header">${day}</div>`).join('');
            
            for (let i = 0; i < 42; i++) {
                const date = new Date(startDate);
                date.setDate(startDate.getDate() + i);
                
                const dateStr = date.toISOString().split('T')[0];
                const dayEntries = entries.filter(entry => entry.date === dateStr);
                const dayTotal = dayEntries.reduce((sum, entry) => 
                    sum + (entry.type === 'income' ? entry.amount : -entry.amount), 0);
                
                const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                const hasEntries = dayEntries.length > 0;
                
                html += `
                    <div class="calendar-day ${hasEntries ? 'has-entries' : ''}" 
                         onclick="selectCalendarDay('${dateStr}')"
                         style="opacity: ${isCurrentMonth ? 1 : 0.3}">
                        <div class="day-number">${date.getDate()}</div>
                        ${hasEntries ? `<div class="day-total">$${dayTotal.toFixed(0)}</div>` : ''}
                    </div>
                `;
            }
            
            container.innerHTML = html;
        }

        // Select calendar day
        function selectCalendarDay(dateStr) {
            const dayEntries = entries.filter(entry => entry.date === dateStr);
            
            document.getElementById('selectedDateTitle').textContent = new Date(dateStr).toLocaleDateString();
            
            if (dayEntries.length === 0) {
                document.getElementById('dayEntries').innerHTML = '<p>No entries for this day.</p>';
            } else {
                document.getElementById('dayEntries').innerHTML = dayEntries.map(entry => `
                    <div class="entry-item">
                        <div class="entry-info">
                            <div class="entry-description">${entry.description}</div>
                            <div class="entry-meta">${entry.time} • ${entry.category}</div>
                        </div>
                        <div class="entry-amount ${entry.type}">
                            ${entry.type === 'income' ? '+' : '-'}$${entry.amount.toFixed(2)}
                        </div>
                    </div>
                `).join('');
            }
            
            document.getElementById('dayDetails').classList.remove('hidden');
        }

        // Change calendar month
        function changeMonth(direction) {
            currentDate.setMonth(currentDate.getMonth() + direction);
            updateCalendar();
        }

        // Handle Enter key in input
        document.getElementById('entryInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addEntry();
            }
        });

        // Initialize app
        updateDisplay();
