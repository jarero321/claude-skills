# claude-skills demo
# Records searching for a skill and installing it

Output docs/demo.gif

Require node

Set Shell "bash"
Set Theme "Dracula"
Set FontSize 14
Set Width 900
Set Height 500
Set Padding 20
Set TypingSpeed 50ms

# Start the CLI
Type "claude-skills"
Enter
Sleep 3s

# Main menu: select "Search skills" (4th option, need 3 Downs)
Down
Sleep 200ms
Down
Sleep 200ms
Down
Sleep 200ms
Enter
Sleep 1s

# Search query prompt: type search term
Type "atomic"
Sleep 500ms
Enter
Sleep 3s

# Show search results for a moment
Sleep 3s

# Back to main menu — select "Install skill" (1st option, already highlighted)
Enter
Sleep 1s

# Search query for install
Type "atomic"
Sleep 500ms
Enter
Sleep 3s

# Select skill to install (1st result)
Enter
Sleep 5s

# Wait for installation to complete
Sleep 3s
