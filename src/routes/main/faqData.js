import chooseQuestionType from "../../assets/faq/choose_question_type.png";
import createBoard from "../../assets/faq/create_board.png";
import createDesc from "../../assets/faq/create_desc.png";
import createTest from "../../assets/faq/create_test.png";
import createTestAfterInit from "../../assets/faq/create_test_after_init.png";
import createNew from "../../assets/faq/create_new.png";
import createPost from "../../assets/faq/create_post.png";
import createPostInBoard from "../../assets/faq/create_post_in_board.png";
import questionMenu from "../../assets/faq/question_menu.png";
import createMcq from "../../assets/faq/create_mcq.png";
import createCodeQuestion from "../../assets/faq/create_code_question.png";
import codePreview from "../../assets/faq/code_preview.png";
import editCode from "../../assets/faq/edit_code.png";
import draftTestsPage from "../../assets/faq/draft_tests_page.png";
import saveTest from "../../assets/faq/save_test.png";

export const FAQ_ITEMS = [
  {
    id: "what-is-unimespace",
    category: "General",
    question: "What is UnimeSpace?",
    shortAnswer:
      "A community-driven platform for learning, sharing posts/files, and creating tests (MCQ + coding).",
    answer:
      "UnimeSpace is a place where students can join communities, share posts and materials, and create/practice tests. It’s designed to make exam prep and collaboration simpler.",
    isTutorial: false,
  },
  {
    id: "what-is-board",
    category: "General",
    question: "What is a Board?",
    shortAnswer:
      "A Board is a collection of posts and discussions with similar themes and topics.",
    answer: `A **Board** is a container for:

- posts
- messages (with attachable files/photos)
- announcements

All of these usually share a **similar theme or topic**.

It is used for **discussions** and **posts**, not for tests.`,
    isTutorial: false,
  },
  {
    id: "what-is-desc",
    category: "General",
    question: "What is a Desc?",
    shortAnswer: "A Desc is a collection of tests and practice.",
    answer: `A **Desc** is a container for:

- tests
- quizzes
- MCQs
- coding problems

It is used for **practice** and **checking knowledge**, **not** for posts or long discussions.`,
    isTutorial: false,
  },
  {
    id: "create-desc",
    category: "Tutorials",
    question: "How do I create a Desc (community)?",
    shortAnswer: "Use the Create menu, choose Community, and fill out the form.",
    answer:
      "Descs are communities. You can create one from the sidebar and then share posts/tests inside it.",
    isTutorial: true,
    tutorial: `## Create a Desc (community)

1. Open the left sidebar and click **Create new**.
2. Select **Community**.
![Create new menu](${createNew})

3. In the community form, choose **Desc** as the type.
![Create desc form](${createDesc})

4. Fill in the desc name and description, then click **Create** to submit.

### Tip
- Pick a clear name and description so others can find it easily
- Descs are perfect for organizing tests and practice sessions`,
  },
  {
    id: "create-board",
    category: "Tutorials",
    question: "How do I create a Board?",
    shortAnswer: "Go to Create → Community, then create a board inside the community.",
    answer:
      "Boards help you organize content inside a community (e.g., “Announcements”, “DSA”, “Exam resources”).",
    isTutorial: true,
    tutorial: `## Create a Board

1. Open the left sidebar and click **Create new**.
2. Select **Community**.
![Create new menu](${createNew})

3. In the community form, choose **Board** as the type.
![Create board](${createBoard})

4. Fill in the board name and description, then click **Create** to submit.

### Good board ideas
- Announcements
- Lecture notes
- DSA practice
- Exam tips`,
  },
  {
    id: "create-post",
    category: "Tutorials",
    question: "How do I create a Post?",
    shortAnswer: "Use Create → Post, then choose where to publish it.",
    answer:
      "Posts can include text, links, and files/images depending on your permissions and the community settings.",
    isTutorial: true,
    tutorial: `## Create a Post

1. Open the left sidebar and click **Create new** → **Post**.

2. Search and select the board you want to publish the post, then write your post content.
![Create post editor](${createPost})

3. Or go to the board you want to publish the post, click \`What is on your mind\` input, and fill out the form in the 2nd step without searching for a board
![Create post in board](${createPostInBoard})

### Tip
- Use headings and short paragraphs for readability.`,
  },
  {
    id: "create-test",
    category: "Tutorials",
    question: "How do I create a Test (MCQ + Code questions)?",
    shortAnswer:
      "Use Create → Test, set the details, then add questions (MCQ or Code). Manage questions via the question menu and save drafts.",
    answer:
      "Tests can include multiple question types. You can draft tests and continue editing later. Use the question menu to navigate and manage your questions.",
    isTutorial: true,
    tutorial: `## Create a Test

### Step 1: Initialize the Test

1. Open the left sidebar and click **Create new** → **Test**.

2. Search and select desc, fill in the test title and description, then initialize the test.
![Create test](${createTest})

3. After initializing, you'll have the test editor. Click \`Add question\` button to create a question.
![After create](${createTestAfterInit})

### Step 2: Add Questions

4. After clicking \`Add question\` button, you will have a dropdown to select question type. Choose the question type you want to add.
![Choose question type](${chooseQuestionType})

#### Adding Multiple Choice Questions

5. Select **Multiple Choice** from the Step 2.4 and fill out the form with your question and options.
![Create MCQ](${createMcq})

- Mark the correct answer(s)
- Add multiple options as needed

#### Adding Code Questions

6. Select **Code Question** and fill out the form.
![Create code question](${createCodeQuestion})
Note that for \`Function Name\`, just write the name of the function without declaration.

### Step 3: Manage Questions

7. Use the **question menu** (three vertical dots) to edit, preview (in code questions), or remove the question.
![Question menu](${questionMenu})

8. Preview the code question to verify formatting, test cases and the logic.
![Code preview](${codePreview})

9. If needed, edit the code question
![Edit code](${editCode})

### Step 4: Save or Continue Later

10. Your test is automatically saved as a draft. You can return to it anytime from **Create new** → **Drafts**, or \`Drafts\` button in the **Create Test** page. Inside **Drafts** page, you can select the test to continue or remove them.
![Draft tests page](${draftTestsPage})

11. Click \`Save Test \` to publish your test. Until you save the test, it will not be published.
![Save test](${saveTest})


### Tips

- Keep questions focused and add clear constraints + examples where possible
- Use the question menu to manage your question
- Preview code questions before finalizing to catch formatting issues
- Drafts allow you to work on tests incrementally`,
  },
];


