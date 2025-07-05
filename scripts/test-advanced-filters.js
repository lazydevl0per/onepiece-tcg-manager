#!/usr/bin/env node

// Simple test for advanced filtering logic
function testAdvancedFilters() {
  console.log('🧪 Testing Advanced Filter Logic...\n');

  // Mock card data for testing
  const mockCards = [
    {
      id: 'OP01-001',
      name: 'Monkey D. Luffy',
      cost: 4,
      power: 5000,
      counter: '1000',
      color: 'red',
      type: 'CHARACTER',
      rarity: 'SR',
      ability: 'This character gains +1000 power when attacking',
      trigger: 'When this character attacks',
      family: 'Straw Hat Pirates',
      pack_id: '569001',
      owned: 1
    },
    {
      id: 'OP01-002',
      name: 'Roronoa Zoro',
      cost: 3,
      power: 4000,
      counter: null,
      color: 'green',
      type: 'CHARACTER',
      rarity: 'R',
      ability: 'This character can attack twice per turn',
      trigger: null,
      family: 'Straw Hat Pirates',
      pack_id: '569001',
      owned: 0
    },
    {
      id: 'OP01-003',
      name: 'Gum-Gum Pistol',
      cost: 2,
      power: null,
      counter: null,
      color: 'red',
      type: 'EVENT',
      rarity: 'C',
      ability: 'Deal 2000 damage to a character',
      trigger: null,
      family: null,
      pack_id: '569001',
      owned: 2
    },
    {
      id: 'OP01-004',
      name: 'Three Sword Style',
      cost: 1,
      power: null,
      counter: '2000',
      color: 'green',
      type: 'STAGE',
      rarity: 'UC',
      ability: 'Your characters gain +1000 power',
      trigger: 'When you play this card',
      family: null,
      pack_id: '569001',
      owned: 1
    }
  ];

  // Test filtering function (simplified version of our actual logic)
  function filterCards(cards, searchTerm = '', colorFilter = 'all', typeFilter = 'all', 
                      rarityFilter = 'all', setFilter = 'all', advancedTextFilter = '', 
                      costFilter = 'all', powerFilter = 'all', counterFilter = 'all') {
    return cards.filter(card => {
      // Basic search filter
      const matchesSearch = !searchTerm || 
        card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Advanced text filter
      const matchesAdvancedText = !advancedTextFilter || 
        card.name.toLowerCase().includes(advancedTextFilter.toLowerCase()) ||
        (card.ability && card.ability.toLowerCase().includes(advancedTextFilter.toLowerCase())) ||
        (card.trigger && card.trigger.toLowerCase().includes(advancedTextFilter.toLowerCase())) ||
        (card.family && card.family.toLowerCase().includes(advancedTextFilter.toLowerCase()));
      
      // Cost filter
      const matchesCost = costFilter === 'all' || 
        (costFilter === '10+' && card.cost >= 10) ||
        card.cost === parseInt(costFilter);
      
      // Power filter
      const matchesPower = powerFilter === 'all' || 
        (powerFilter === '10000+' && card.power && card.power >= 10000) ||
        (card.power && card.power === parseInt(powerFilter));
      
      // Counter filter
      const matchesCounter = counterFilter === 'all' || 
        (counterFilter === '10000+' && card.counter && parseInt(card.counter) >= 10000) ||
        (card.counter && parseInt(card.counter) === parseInt(counterFilter));
      
      // Basic filters
      const matchesColor = colorFilter === 'all' || card.color === colorFilter;
      const matchesType = typeFilter === 'all' || card.type === typeFilter;
      const matchesRarity = rarityFilter === 'all' || card.rarity === rarityFilter;
      const matchesSet = setFilter === 'all' || card.pack_id === setFilter;
      
      return matchesSearch && matchesAdvancedText && matchesCost && matchesPower && 
             matchesCounter && matchesColor && matchesType && matchesRarity && matchesSet;
    });
  }

  let passed = 0;
  let total = 0;

  // Test 1: Basic search filter
  total++;
  const basicSearchResult = filterCards(mockCards, 'Luffy');
  if (basicSearchResult.length === 1 && basicSearchResult[0].name === 'Monkey D. Luffy') {
    console.log('✅ Basic search filter works');
    passed++;
  } else {
    console.log('❌ Basic search filter failed');
  }

  // Test 2: Advanced text filter
  total++;
  const advancedTextResult = filterCards(mockCards, '', 'all', 'all', 'all', 'all', 'attack');
  if (advancedTextResult.length === 2) {
    console.log('✅ Advanced text filter works');
    passed++;
  } else {
    console.log('❌ Advanced text filter failed');
  }

  // Test 3: Cost filter
  total++;
  const costResult = filterCards(mockCards, '', 'all', 'all', 'all', 'all', '', '3');
  if (costResult.length === 1 && costResult[0].name === 'Roronoa Zoro') {
    console.log('✅ Cost filter works');
    passed++;
  } else {
    console.log('❌ Cost filter failed');
  }

  // Test 4: Power filter
  total++;
  const powerResult = filterCards(mockCards, '', 'all', 'all', 'all', 'all', '', 'all', '5000');
  if (powerResult.length === 1 && powerResult[0].name === 'Monkey D. Luffy') {
    console.log('✅ Power filter works');
    passed++;
  } else {
    console.log('❌ Power filter failed');
  }

  // Test 5: Counter filter
  total++;
  const counterResult = filterCards(mockCards, '', 'all', 'all', 'all', 'all', '', 'all', 'all', '1000');
  if (counterResult.length === 1 && counterResult[0].name === 'Monkey D. Luffy') {
    console.log('✅ Counter filter works');
    passed++;
  } else {
    console.log('❌ Counter filter failed');
  }

  // Test 6: Combined filters
  total++;
  const combinedResult = filterCards(mockCards, '', 'red', 'CHARACTER', 'all', 'all', '', 'all', 'all', 'all');
  if (combinedResult.length === 1 && combinedResult[0].name === 'Monkey D. Luffy') {
    console.log('✅ Combined filters work');
    passed++;
  } else {
    console.log('❌ Combined filters failed');
  }

  // Test 7: Color filter
  total++;
  const colorResult = filterCards(mockCards, '', 'green', 'all', 'all', 'all');
  if (colorResult.length === 2) {
    console.log('✅ Color filter works');
    passed++;
  } else {
    console.log('❌ Color filter failed');
  }

  // Test 8: Type filter
  total++;
  const typeResult = filterCards(mockCards, '', 'all', 'EVENT', 'all', 'all');
  if (typeResult.length === 1 && typeResult[0].name === 'Gum-Gum Pistol') {
    console.log('✅ Type filter works');
    passed++;
  } else {
    console.log('❌ Type filter failed');
  }

  console.log(`\n🎉 Test Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('✅ All advanced filter tests passed!');
    return true;
  } else {
    console.log('❌ Some tests failed');
    return false;
  }
}

// Run the test
if (!testAdvancedFilters()) {
  process.exit(1);
} 