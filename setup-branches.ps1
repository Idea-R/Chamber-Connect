# Chamber Connect - Branch Setup Script
# Run this script to set up local tracking branches for the new Git workflow

Write-Host "🚀 Setting up Chamber Connect Git Branches..." -ForegroundColor Green
Write-Host ""

try {
    # Fetch all remote branches
    Write-Host "📥 Fetching remote branches..." -ForegroundColor Yellow
    git fetch origin
    
    # Check current branch
    $currentBranch = git branch --show-current
    Write-Host "📍 Current branch: $currentBranch" -ForegroundColor Cyan
    
    # Create local dev branch tracking remote
    Write-Host "🔧 Setting up dev branch..." -ForegroundColor Yellow
    $devExists = git branch --list "dev"
    if ($devExists) {
        Write-Host "   ✅ dev branch already exists locally" -ForegroundColor Green
        git checkout dev
        git pull origin dev
    } else {
        git checkout -b dev origin/dev
        Write-Host "   ✅ Created local dev branch tracking origin/dev" -ForegroundColor Green
    }
    
    # Create local staging branch tracking remote
    Write-Host "🔧 Setting up staging branch..." -ForegroundColor Yellow
    $stagingExists = git branch --list "staging"
    if ($stagingExists) {
        Write-Host "   ✅ staging branch already exists locally" -ForegroundColor Green
        git checkout staging
        git pull origin staging
    } else {
        git checkout -b staging origin/staging
        Write-Host "   ✅ Created local staging branch tracking origin/staging" -ForegroundColor Green
    }
    
    # Return to master branch
    Write-Host "🔧 Returning to master branch..." -ForegroundColor Yellow
    git checkout master
    git pull origin master
    Write-Host "   ✅ Updated master branch" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "🎉 Branch setup complete!" -ForegroundColor Green
    Write-Host ""
    
    # Show branch status
    Write-Host "📋 Branch Overview:" -ForegroundColor Cyan
    Write-Host "-------------------" -ForegroundColor Cyan
    $branches = git branch -vv
    $branches | ForEach-Object {
        if ($_ -match "\*") {
            Write-Host $_ -ForegroundColor Green
        } else {
            Write-Host $_ -ForegroundColor White
        }
    }
    
    Write-Host ""
    Write-Host "📖 Next Steps:" -ForegroundColor Yellow
    Write-Host "1. Review the Git workflow documentation in docs/git-workflow.md"
    Write-Host "2. Set up branch protection rules in GitHub (see documentation)"
    Write-Host "3. Configure CI/CD pipelines for automatic deployments"
    Write-Host "4. Start using the new workflow for feature development"
    Write-Host ""
    Write-Host "🔗 Quick Commands:" -ForegroundColor Cyan
    Write-Host "  New feature: git checkout dev && git checkout -b feature/your-feature"
    Write-Host "  View workflow: cat docs/git-workflow.md"
    Write-Host ""
    
} catch {
    Write-Host "❌ Error during setup: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please check your Git configuration and try again." -ForegroundColor Red
    exit 1
}

Write-Host "✨ Ready to use the new Git workflow!" -ForegroundColor Magenta 