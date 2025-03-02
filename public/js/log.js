// Store the original console error function to track errors
let errorDetected = false;
const originalConsoleError = console.error;

console.error = function (...args) {
    errorDetected = true;
    originalConsoleError.apply(console, args);
};

console.log(`
%c            @@%*++==+*#%@           
%c        @#-.............:*         
%c      @=.........::........-       
%c     +.....:-==========:....:-     
%c    -....:===============:...:=    
%c   -....-=====+*###*:..-==-...:    
%c   :...:====+######=::..===-...:   
%c  -:...-====*#######***====-...-   
%c  =:...-====*#########*====-...-   
%c   :...:=====*#######*+====:..:-   
%c   -:...:======+***+======:...:    
%c    =:....-=============-:...:     
%c     *:.....:-=======-:.....:      
%c       #-.................:+       
%c         %*-:.........:-=*         
%c             @@@@@@@@              
                              
`,
"color: #FF6F00; font-weight: bold;",  // Deep orange
"color: #FF7700; font-weight: bold;",  
"color: #FF7F00; font-weight: bold;",  
"color: #FF8700; font-weight: bold;",  
"color: #FF8F00; font-weight: bold;",  
"color: #FF9700; font-weight: bold;",  // Classic orange
"color: #FF9F00; font-weight: bold;",  
"color: #FFA700; font-weight: bold;",  
"color: #FFAF00; font-weight: bold;",  
"color: #FFB700; font-weight: bold;",  
"color: #FFBF00; font-weight: bold;",  
"color: #FFC700; font-weight: bold;",  
"color: #FFCF40; font-weight: bold;",  
"color: #FFD750; font-weight: bold;",  
"color: #FFDF60; font-weight: bold;",  
"color: #FFE770; font-weight: bold;"   // Lightest orange
);

console.log("%c[INFO] %cWelcome to LarpBin – The sleek pastebin!", "color: #FFA500; font-weight: bold;", "color: white;");
console.log("%c[WARNING] %cFor your security, avoid sharing sensitive data in pastes. Your account safety matters!", "color: #FF8800; font-weight: bold;", "color: white;");

// Wait for a moment to ensure error tracking works
setTimeout(() => {
    if (errorDetected) {
        console.log("%c[ERROR] %cErrors detected – Check the console for details.", "color: #FF4500; font-weight: bold;", "color: white;");
    } else {
        console.log("%c[INFO] %cNo errors detected – Enjoy pasting with style!", "color: #FFAA33; font-weight: bold;", "color: white;");
    }
}, 100);
