import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './_components/dashboard/dashboard.component';
import { PageNotFoundComponent } from './_components/page-not-found/page-not-found.component';
import { LoginComponent } from './_components/login/login.component';
import { AuthGuard } from './_guards/auth.guard';
import { RoleSelectionComponent } from './_components/role-selection/role-selection.component';
import { TeacherDashboardComponent } from './_components/dashboard/teacher-dashboard/teacher-dashboard.component';
import { SuperAdminDashboardComponent } from './_components/dashboard/super-admin-dashboard/super-admin-dashboard.component';
import { GroupAdminDashboardComponent } from './_components/dashboard/group-admin-dashboard/group-admin-dashboard.component';
import { SchoolAdminDashboardComponent } from './_components/dashboard/school-admin-dashboard/school-admin-dashboard.component';
import { AddGroupComponent } from './_components/dashboard/super-admin-dashboard/add-group/add-group.component';
import { AddSchoolComponent } from './_components/dashboard/super-admin-dashboard/add-school/add-school.component';
import { AddAdminComponent } from './_components/dashboard/super-admin-dashboard/add-admin/add-admin.component';
import { UpsertMetadataComponent } from './_components/dashboard/super-admin-dashboard/upsert-metadata/upsert-metadata.component';
import { GroupProfileComponent } from './_components/dashboard/group-admin-dashboard/group-profile/group-profile.component';
import { GroupSchoolsComponent } from './_components/dashboard/group-admin-dashboard/group-schools/group-schools.component';
import { SchoolProfileComponent } from './_components/school-profile/school-profile.component';
import { SchoolUsersComponent } from './_components/dashboard/school-admin-dashboard/school-users/school-users.component';
import { UserProfileComponent } from './_components/user-profile/user-profile.component';
import { SchoolUpsertUsersComponent } from './_components/dashboard/school-admin-dashboard/school-upsert-users/school-upsert-users.component';
import { AddQuestionComponent } from './_components/dashboard/teacher-dashboard/add-question/add-question.component';
import { ViewQuestionsComponent } from './_components/dashboard/teacher-dashboard/view-questions/view-questions.component';
import { ViewRequestsComponent } from './_components/dashboard/teacher-dashboard/view-requests/view-requests.component';
import { GeneratePaperComponent } from './_components/dashboard/teacher-dashboard/generate-paper/generate-paper.component';
import { ReviewerDashboardComponent } from './_components/dashboard/reviewer-dashboard/reviewer-dashboard.component';
import { ReviewRequestsComponent } from './_components/dashboard/reviewer-dashboard/review-requests/review-requests.component';
import { ViewQuestionPaperComponent } from './_components/dashboard/teacher-dashboard/view-question-paper/view-question-paper.component';
import { TimetableComponent } from './_components/timetable/timetable.component';
import { ViewTeachersComponent } from './_components/dashboard/reviewer-dashboard/view-teachers/view-teachers.component';
import { RoleGuard } from './_guards/role.guard';

const routes: Routes = [
	{
		path: 'dashboard',
		component: DashboardComponent,
		canActivate: [ AuthGuard ],
		children: [
			{
				path: 'super-admin',
				component: SuperAdminDashboardComponent,
				canActivate: [ AuthGuard, RoleGuard ],
				children: [
					{ path: '', redirectTo: 'group', pathMatch: 'full' },
					{ path: 'group', component: AddGroupComponent, canActivate: [ AuthGuard ] },
					{ path: 'school', component: AddSchoolComponent, canActivate: [ AuthGuard ] },
					{ path: 'admin', component: AddAdminComponent, canActivate: [ AuthGuard ] },
					{ path: 'metadata', component: UpsertMetadataComponent, canActivate: [ AuthGuard ] }
				]
			},
			{
				path: 'group-admin',
				component: GroupAdminDashboardComponent,
				canActivate: [ AuthGuard, RoleGuard ],
				children: [
					{ path: '', redirectTo: 'profile', pathMatch: 'full' },
					{ path: 'profile', component: GroupProfileComponent, canActivate: [ AuthGuard ] },
					{ path: 'schools', component: GroupSchoolsComponent, canActivate: [ AuthGuard ] }
				]
			},
			{
				path: 'school-admin',
				component: SchoolAdminDashboardComponent,
				canActivate: [ AuthGuard, RoleGuard ],
				children: [
					{ path: '', redirectTo: 'users/view', pathMatch: 'full' },
					{ path: 'users/view', component: SchoolUsersComponent, canActivate: [ AuthGuard ] },
					{ path: 'users/upsert', component: SchoolUpsertUsersComponent, canActivate: [ AuthGuard ] }
				]
			},
			{
				path: 'reviewer',
				component: ReviewerDashboardComponent,
				canActivate: [ AuthGuard, RoleGuard ],
				children: [
					{ path: '', redirectTo: 'view-teachers', pathMatch: 'full' },
					{ path: 'view-teachers', component: ViewTeachersComponent, canActivate: [ AuthGuard ] },
					{ path: 'review-requests', component: ReviewRequestsComponent, canActivate: [ AuthGuard ] }
				]
			},
			{
				path: 'teacher',
				component: TeacherDashboardComponent,
				canActivate: [ AuthGuard, RoleGuard ],
				children: [
					{ path: '', redirectTo: 'add-question', pathMatch: 'full' },
					{ path: 'add-question', component: AddQuestionComponent, canActivate: [ AuthGuard ] },
					{ path: 'view-questions', component: ViewQuestionsComponent, canActivate: [ AuthGuard ] },
					{ path: 'view-requests', component: ViewRequestsComponent, canActivate: [ AuthGuard ] },
					{ path: 'generate-paper', component: GeneratePaperComponent, canActivate: [ AuthGuard ] },
					{ path: 'view-question-papers', component: ViewQuestionPaperComponent, canActivate: [ AuthGuard ] }
				]
			}
		]
	},

	{ path: '', redirectTo: 'roles', pathMatch: 'full' },

	{ path: 'roles', component: RoleSelectionComponent, canActivate: [ AuthGuard ] },
	{ path: 'login', component: LoginComponent },
	{ path: 'profile', component: UserProfileComponent, canActivate: [ AuthGuard ] },
	{ path: 'school-profile', component: SchoolProfileComponent, canActivate: [ AuthGuard, RoleGuard ] },
	{ path: 'timetable', component: TimetableComponent, canActivate: [ AuthGuard, RoleGuard ] },
	{ path: 'not-found', component: PageNotFoundComponent },
	{ path: '**', redirectTo: 'not-found' }
];

@NgModule({
	imports: [ RouterModule.forRoot(routes) ],
	exports: [ RouterModule ]
})
export class AppRoutingModule {}
