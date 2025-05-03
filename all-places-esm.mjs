import fs from 'fs';
// import fs1 from 'f' + 's'; // error
// import fs2 from ['f' + 's'].join(''); // error
// import fs3 from `${"f"}s`; // error
// import fs4 from +'fs'; // error
async function getFS() {
    return await import('fs'); // allowed
}