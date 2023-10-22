# Team Development Document

## Project Repository
Repository URL: [https://github.com/rorschach-xiao/CalcSheetPro.git](https://github.com/rorschach-xiao/CalcSheetPro.git)

## General Development Workflow
Our overall development workflow follows a three-tiered approach: `dev` -> `test` -> `main`.

### Development (`dev`)
- Each team member has been assigned their own development branch:
  - Yang Xiao - `dev_xy`
  - Gavin - `dev_xg`
  - Jamie - `dev_zjm`
  - Grace - `dev_xya`
  - Susie - `dev_ysy`
- After cloning the repository using `git clone`, team members should switch to their respective development branches (`dev_xy`, `dev_xg`, etc.) using VSCode.
- Each team member should work on their designated part within their development branch.

### Testing and Integration (`test`)
- After completing development on the individual development branches, merge your changes to the `test` branch.
- In case of merge conflicts, communicate with the team member responsible for the corresponding development task or inform the team via group communication to resolve conflicts.
- Prior to merging your development branch into the `test` branch, always perform a `git pull` to ensure you have the latest changes from the `test` branch. This helps prevent unforeseen bugs and conflicts.
  
### Final Version (`main`)
- The final version of the project is located in the `main` branch.
- Only after comprehensive testing and integration on the `test` branch should you merge the `test` branch into `main`.
- It is strictly forbidden to merge the `test` branch into `main` before testing is complete.
- Do not merge your development branch directly into `main`.

## Team Roles and Responsibilities
- Yang Xiao: Part 2
- Gavin: Part 3 Backend
- Jamie: Part 3 Frontend
- Grace & Susie: Part 1 File Selection & Pagination Display

## Development Progress
- Yang Xiao:
    - Part2(develop in `dev_xy` branch): 
        - Progress: Done
    - Part1 & Part3(develop in `dev_xy_fullstack` branch):
        - Progress: Done

- Ge Xu(Gavin):
    - Part3(develop in `dev_xg` branch): 
         - Progress: Done

- Jamie:

- Grace & Susie:

## Delivery

After discussion, we decided to merge the design in `dev_xy_fullstack` into `test` and `main`.
