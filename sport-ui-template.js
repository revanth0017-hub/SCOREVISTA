// Script to generate sport-specific UI improvements

const sports = {
  cricket: { icon: '🏏', color: 'green', name: 'Cricket' },
  football: { icon: '⚽', color: 'blue', name: 'Football' },
  basketball: { icon: '🏀', color: 'orange', name: 'Basketball' },
  volleyball: { icon: '🏐', color: 'red', name: 'Volleyball' },
  kabaddi: { icon: '👥', color: 'pink', name: 'Kabaddi' },
  tennis: { icon: '🎾', color: 'yellow', name: 'Tennis' },
  shuttle: { icon: '🏸', color: 'teal', name: 'Badminton' }
};

// Generate improved header component for each sport
Object.entries(sports).forEach(([sport, {icon, color, name}]) => {
  console.log(`
// ${name} Header Template
<div className="bg-gradient-to-r from-${color}-500/10 to-transparent border-b border-border px-8 py-6">
  <div className="flex items-center gap-4">
    <div className="w-14 h-14 rounded-xl bg-${color}-500/20 flex items-center justify-center">
      <span className="text-3xl">${icon}</span>
    </div>
    <div>
      <h1 className="text-3xl font-bold text-foreground">${name}</h1>
      <p className="text-sm text-muted-foreground mt-1">{{subtitle}}</p>
    </div>
  </div>
</div>
  `);
});
