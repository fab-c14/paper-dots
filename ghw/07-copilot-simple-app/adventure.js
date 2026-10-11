const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const inputLines = rl[Symbol.asyncIterator]();

function ask(question) {
  process.stdout.write(question);
  return inputLines.next().then(({ value, done }) => {
    if (done) {
      throw new Error('No more input was provided.');
    }

    return value;
  });
}

async function choose(prompt, choices) {
  console.log(`\n${prompt}`);
  choices.forEach((choice, index) => {
    console.log(`${index + 1}. ${choice}`);
  });

  while (true) {
    const answer = await ask('Choose a number: ');
    const choice = Number.parseInt(answer.trim(), 10);

    if (choice >= 1 && choice <= choices.length) {
      return choice;
    }

    console.log(`Please enter a number from 1 to ${choices.length}.`);
  }
}

async function playAdventure() {
  console.log('THE LANTERN OF STARFALL');
  console.log('A tiny choose-your-own-adventure');
  console.log('\nYou wake beneath an ancient oak with a silver lantern in your hand.');
  console.log('Beyond the trees, a distant bell rings three times.');

  const firstChoice = await choose(
    'Scene 1: At the Forest Edge',
    [
      'Follow the lantern light into the whispering woods.',
      'Climb the hill toward the sound of the bell.',
      'Cross the old bridge and head for the village.',
    ],
  );

  if (firstChoice === 1) {
    console.log('\nThe trees lean aside as if they recognize the lantern.');
  } else if (firstChoice === 2) {
    console.log('\nFrom the hilltop, you spot a trail of blue sparks below.');
  } else {
    console.log('\nThe bridge creaks, but a warm light flickers in a cottage window.');
  }

  const secondChoice = await choose(
    'Scene 2: The Hidden Door',
    [
      'Open the door marked with a crescent moon.',
      'Knock three times and wait.',
      'Place the silver lantern on the stone beside the door.',
    ],
  );

  if (secondChoice === 1) {
    console.log('\nInside, shelves of maps reveal a route to a forgotten observatory.');
  } else if (secondChoice === 2) {
    console.log('\nA friendly fox opens the door and points toward a staircase.');
  } else {
    console.log('\nThe lantern flares, revealing a staircase beneath the earth.');
  }

  const thirdChoice = await choose(
    'Scene 3: The Starfall Chamber',
    [
      'Use the lantern to relight the fallen star.',
      'Carry the star outside and return it to the sky.',
      'Make a wish and leave the mystery untouched.',
    ],
  );

  console.log('\nENDING');
  if (thirdChoice === 1) {
    console.log('The star blazes to life. Dawn arrives early, and your name becomes a song.');
  } else if (thirdChoice === 2) {
    console.log('The star rises into the heavens. In return, it grants the village one year of peace.');
  } else {
    console.log('You leave quietly. The mystery remains, but the silver lantern guides you safely home.');
  }

  console.log('\nThank you for playing!');
  rl.close();
}

playAdventure().catch((error) => {
  console.error('\nSomething went wrong:', error.message);
  rl.close();
  process.exitCode = 1;
});
