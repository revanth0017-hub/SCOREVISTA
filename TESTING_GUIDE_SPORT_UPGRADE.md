# Sport-Specific Upgrade - Quick Testing Guide

## 🚀 Getting Started

### Prerequisites
- Backend: Node.js running on port 5001
- Frontend: Next.js running on port 3000
- MongoDB: Connected and accessible

### Start Backend
```bash
cd backend
npm run dev
```

### Start Frontend  
```bash
cd ..
pnpm dev
```

---

## ✅ Cricket Quick Entry Test

### Test Cricket Ball-by-Ball Updates

**Objective:** Enter cricket runs and wickets using quick buttons

**Steps:**
1. Login as admin
2. Navigate to **Admin Dashboard** → Select **Cricket**
3. Click **Admin Assistant**
4. Click "Update Match Score"
5. Select any cricket match (or type "Team A vs Team B")
6. You should see:
   - Cricket-specific prompt: "Ball-by-ball update..."
   - **Quick buttons:** [1] [2] [3] [4] [6] [W] [Wide] [No Ball] [LB] [Bye]
   - Form with fields: Runs A/B, Wickets A/B, Overs A/B

**Test Flow:**
- Click [1] button → Runs should +1
- Click [4] button → Runs should +4
- Click [W] button → Wickets should +1
- Click [6] button → Runs should +6 (check overs advance)
- Verify overs format: "15.3" format

**Expected Result:** ✅
- Runs and wickets update instantly
- Overs advance properly (6 balls = 1 over)
- Form shows updated values

---

## ⚽ Football Quick Entry Test

### Test Football Goal Counter

**Objective:** Increment goals using quick buttons

**Steps:**
1. Select **Football** in admin
2. Open **Admin Assistant**
3. Click "Update Match Score"
4. Select a football match
5. You should see:
   - Football-specific prompt
   - **Quick buttons:** [+ Goal A] [+ Goal B] [1st Half] [Half Time] [2nd Half] [Full Time]
   - Form with: Goals A, Goals B

**Test Flow:**
- Click [+ Goal A] → Goals A: 0 → 1
- Click [+ Goal B] → Goals B: 0 → 1
- Click [1st Half] → Phase updates in form
- Click [2nd Half] → Phase updates
- Verify goals display in form

**Expected Result:** ✅
- Goal increments work instantly
- Phase buttons update correctly
- Real-time reflection in form

---

## 🏀 Basketball Quick Entry Test

### Test Basketball Points

**Objective:** Track points per quarter

**Steps:**
1. Select **Basketball** in admin
2. Open **Admin Assistant**
3. Click "Update Match Score"
4. Select a basketball match
5. You should see:
   - Quick buttons: [+1 Point] [+2 Points] [+3 Points] [Q1] [Q2] [Q3] [Q4]
   - Form with: Points A, Points B, Quarter

**Test Flow:**
- Click [+3 Points] → Points A: 0 → 3
- Click [+2 Points] → Points A: 3 → 5
- Click [+1 Point] → Points A: 5 → 6
- Click [Q2] → Quarter updates to "Q2"

**Expected Result:** ✅
- Points accumulate correctly
- Quarter tracking works
- Multiple increments per team possible

---

## 🎾 Tennis Set Scoring Test

### Test Tennis Sets and Game Points

**Objective:** Enter tennis set scores

**Steps:**
1. Select **Tennis** in admin
2. Open **Admin Assistant**
3. Click "Update Match Score"
4. Select a tennis match
5. You should see:
   - Quick buttons: [0] [15] [30] [40] [Deuce] [Ad-A] [Ad-B]
   - Form with set pair entry boxes
   - Label: "Set scores (Team A — Team B), e.g. 6-4"

**Test Flow:**
- Enter set 1: "6-4"
- Enter set 2: "7-5"
- Leave other sets empty
- Click "Review update"
- Verify set scores display correctly

**Expected Result:** ✅
- Set pairs parse correctly (6-4 format)
- Multiple sets supported
- Set winner calculation works

---

## 🏐 Volleyball Set Scoring Test

### Test Volleyball Rally Scoring

**Objective:** Track volleyball sets

**Steps:**
1. Select **Volleyball** in admin
2. Open **Admin Assistant**
3. Click "Update Match Score"
4. Select a volleyball match
5. You should see:
   - Quick buttons: [+ Point A] [+ Point B] [Next Set]
   - Form with set entry boxes (to 25 points)

**Test Flow:**
- Enter sets: "25-23", "24-26", "25-20"
- Verify set winner calculation (A: 2, B: 1)
- Check display format

**Expected Result:** ✅
- Set scores calculate winners correctly
- Multiple sets supported
- Form validates scores

---

## 👥 Kabaddi Raid/Tackle Test

### Test Kabaddi Points Tracking

**Objective:** Track raids, tackles, and total

**Steps:**
1. Select **Kabaddi** in admin
2. Open **Admin Assistant**
3. Click "Update Match Score"
4. Select a kabaddi match
5. You should see:
   - Quick buttons: [Raid A] [Tackle A] [Raid B] [Tackle B]
   - Form with: Raid A/B, Tackle A/B, Total A/B

**Test Flow:**
- Click [Raid A] repeatedly → Raid points increase
- Click [Tackle A] → Tackle points increase
- Verify total = raid + tackle
- Check form totals calculation

**Expected Result:** ✅
- Raid and tackle points track separately
- Total calculated correctly
- Both buttons work independently

---

## 🏸 Badminton/Shuttle Test

### Test Shuttle Game Scoring

**Objective:** Track shuttle game points

**Steps:**
1. Select **Shuttle** in admin
2. Open **Admin Assistant**
3. Click "Update Match Score"
4. Select a shuttle match
5. You should see:
   - Quick buttons: [+ Point A] [+ Point B] [Next Set]
   - Form with set entry boxes (to 21 points)

**Test Flow:**
- Enter sets: "21-19", "21-15"
- Verify set winners (A: 2, B: 0)
- Check rally scoring format

**Expected Result:** ✅
- Sets track to 21 points
- Multiple game sets supported
- Winner calculation works

---

## 🔄 Real-Time Updates Test

### Test Live Dashboard Updates

**Objective:** Verify socket broadcasts update user dashboard instantly

**Setup:**
- Open **2 browser windows/tabs**
- Tab 1: Admin → Cricket Assistant
- Tab 2: User Dashboard → Cricket page

**Test Flow:**
1. In Tab 1: Update cricket match scores (click quick buttons)
2. In Tab 2: Watch for instant updates
3. Verify:
   - Score numbers update
   - Status reflects changes
   - No page refresh needed

**Expected Result:** ✅
- Real-time updates appear in <1 second
- Both global and sport-specific rooms work
- Live badge pulses in admin panel

---

## 📱 Sport-Specific Hints Test

### Test In-App Hints

**Objective:** Verify sport-specific guidance appears

**Steps:**
1. Select different sports one by one
2. Open "Update Match Score" flow
3. Check assistant prompts:
   - Cricket: Mentions ball-by-ball, overs format
   - Football: Mentions match phases
   - Basketball: Mentions quarters
   - Tennis: Mentions game points (0,15,30,40)
   - Volleyball: Mentions rally scoring
   - Kabaddi: Mentions raids vs tackles
   - Shuttle: Mentions 21-point games

**Expected Result:** ✅
- Prompts are uniquely tailored per sport
- Navigation buttons show correct sport name
- Form fields match sport requirements

---

## 🐛 Bug Checklist

**Verify these work correctly:**
- [ ] All 7 sports have unique quick buttons
- [ ] Cricket overs format accepts "15.2" style
- [ ] Football goal counters don't go negative
- [ ] Tennis game points cycle correctly (0→15→30→40→Deuce)
- [ ] Volleyball sets validate to 25 max
- [ ] Kabaddi totals auto-calculate from raid+tackle
- [ ] Shuttle supports multiple games (to 21)
- [ ] Quick buttons are disabled during save (loading state)
- [ ] Socket room broadcasts work (`sport:{sportId}`)
- [ ] Teams with player lists can be created
- [ ] Backwards compatibility: old scoreA/scoreB still work

---

## 📊 Performance Checks

**Monitor these metrics:**
- Quick button click → score update: <100ms
- Form submission → socket broadcast: <500ms
- Socket event → UI update (other tab): <1s
- Database query for matches: <200ms
- Socket room filtering: No lag

---

## 📝 Testing Notes

### If Quick Buttons Don't Appear:
1. Check browser console for errors
2. Verify `sport-specific-actions.ts` is imported
3. Ensure `sportSlug` is passed correctly to form
4. Clear browser cache

### If Socket Updates Don't Work:
1. Check backend logs for socket connections
2. Verify `io.to('sport:${sportId}')` syntax
3. Check CORS settings in `index.js`
4. Ensure client is joining sport room on load

### If Forms Reset:
1. Check for unintended re-renders
2. Verify form state management in component
3. Check for conflicting hook dependencies

---

## ✨ Success Criteria

**All tests pass when:**
- ✅ Quick buttons appear for all 7 sports
- ✅ Buttons update form values instantly
- ✅ Sport-specific prompts appear in assistant
- ✅ Socket broadcasts reach user dashboard
- ✅ No console errors
- ✅ Performance is snappy (<500ms responses)
- ✅ Backwards compatibility maintained

---

## 🎯 Next Steps After Testing

If all tests pass:
1. **Document** any edge cases or unexpected behaviors
2. **Deploy** to production with monitoring
3. **Monitor** Socket.IO connection pool
4. **Gather** admin feedback on quick buttons
5. **Plan** Phase 2: player-level statistics tracking

---

**Test Report:** [Save your results here]

**Tester Name:** _________________  
**Date:** _________________  
**All Passed:** ☐ Yes ☐ No  
**Issues Found:** [List any bugs or concerns]
