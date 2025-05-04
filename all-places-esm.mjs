import fs from 'fs';
// import fs1 from 'f' + 's'; // error
// import fs2 from ['f' + 's'].join(''); // error
// import fs3 from `${"f"}s`; // error
// import fs4 from +'fs'; // error
if (process.env) {
    // import fs5 from 'fs'; // error
}

async function getFS() {
    return await import('fs'); // allowed
}
const fs6 = await getFS();

console.info(fs === fs6.default); // true
console.info(fs === fs2); // true